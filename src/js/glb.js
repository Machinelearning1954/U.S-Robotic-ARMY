// REZONANCE — minimal GLB (glTF-binary) loader for static props.
// Covers what image-to-3D services actually emit (TripoSR, Higgsfield
// image_to_3d, Meshy): a GLB container with one or more unskinned mesh
// primitives, tightly packed attributes, and an optional embedded
// baseColor texture. No animation, no skinning, no extensions — for
// anything richer, vendor three's full GLTFLoader instead.
import * as THREE from "../vendor/three.module.js";

const MAGIC = 0x46546c67; // 'glTF'
const CHUNK_JSON = 0x4e4f534a;
const CHUNK_BIN = 0x004e4942;

const COMPONENT = {
  5120: Int8Array,
  5121: Uint8Array,
  5122: Int16Array,
  5123: Uint16Array,
  5125: Uint32Array,
  5126: Float32Array,
};
const SIZE = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 };

function accessorToArray(json, bin, index) {
  const acc = json.accessors[index];
  const bv = json.bufferViews[acc.bufferView];
  const Ctor = COMPONENT[acc.componentType];
  const per = SIZE[acc.type];
  const offset = (bv.byteOffset || 0) + (acc.byteOffset || 0);
  const stride = bv.byteStride;
  if (!stride || stride === per * Ctor.BYTES_PER_ELEMENT) {
    return new Ctor(bin, offset, acc.count * per);
  }
  // interleaved: de-stride into a fresh array
  const out = new Ctor(acc.count * per);
  const view = new DataView(bin);
  const read = {
    [Int8Array.name]: (o) => view.getInt8(o),
    [Uint8Array.name]: (o) => view.getUint8(o),
    [Int16Array.name]: (o) => view.getInt16(o, true),
    [Uint16Array.name]: (o) => view.getUint16(o, true),
    [Uint32Array.name]: (o) => view.getUint32(o, true),
    [Float32Array.name]: (o) => view.getFloat32(o, true),
  }[Ctor.name];
  const cb = Ctor.BYTES_PER_ELEMENT;
  for (let i = 0; i < acc.count; i++) {
    for (let j = 0; j < per; j++) {
      out[i * per + j] = read(offset + i * stride + j * cb);
    }
  }
  return out;
}

async function textureFromImage(json, bin, texIndex) {
  const tex = json.textures?.[texIndex];
  const img = json.images?.[tex?.source];
  if (!img || img.bufferView === undefined) return null;
  const bv = json.bufferViews[img.bufferView];
  const blob = new Blob(
    [new Uint8Array(bin, bv.byteOffset || 0, bv.byteLength)],
    { type: img.mimeType || "image/png" }
  );
  const bitmap = await createImageBitmap(blob);
  const t = new THREE.Texture(bitmap);
  t.colorSpace = THREE.SRGBColorSpace;
  t.flipY = false; // glTF UV convention
  t.needsUpdate = true;
  return t;
}

async function materialFrom(json, bin, matIndex) {
  const def = json.materials?.[matIndex];
  const pbr = def?.pbrMetallicRoughness || {};
  const params = {
    color: new THREE.Color().fromArray(pbr.baseColorFactor || [1, 1, 1]),
    roughness: pbr.roughnessFactor !== undefined ? pbr.roughnessFactor : 1,
    metalness: pbr.metallicFactor !== undefined ? pbr.metallicFactor : 0,
  };
  if (pbr.baseColorTexture) {
    params.map = await textureFromImage(json, bin, pbr.baseColorTexture.index);
  }
  if (def?.doubleSided) params.side = THREE.DoubleSide;
  return new THREE.MeshStandardMaterial(params);
}

function nodeMatrix(node) {
  const m = new THREE.Matrix4();
  if (node.matrix) return m.fromArray(node.matrix);
  const t = node.translation || [0, 0, 0];
  const r = node.rotation || [0, 0, 0, 1];
  const s = node.scale || [1, 1, 1];
  return m.compose(
    new THREE.Vector3().fromArray(t),
    new THREE.Quaternion().fromArray(r),
    new THREE.Vector3().fromArray(s)
  );
}

/**
 * Load a .glb from a URL into a THREE.Group.
 * options.targetSize — uniformly rescale + recenter so the model's largest
 * dimension equals this (ground-sitting: min-Y ends at y=0). Omit for raw.
 */
export async function loadGLB(url, { targetSize } = {}) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GLB fetch failed ${res.status}: ${url}`);
  const buf = await res.arrayBuffer();
  const dv = new DataView(buf);
  if (dv.getUint32(0, true) !== MAGIC) throw new Error("not a GLB file");
  let offset = 12, json = null, bin = null;
  while (offset < buf.byteLength) {
    const len = dv.getUint32(offset, true);
    const type = dv.getUint32(offset + 4, true);
    const chunk = buf.slice(offset + 8, offset + 8 + len);
    if (type === CHUNK_JSON) json = JSON.parse(new TextDecoder().decode(chunk));
    else if (type === CHUNK_BIN) bin = chunk;
    offset += 8 + len;
  }
  if (!json) throw new Error("GLB has no JSON chunk");

  const group = new THREE.Group();
  const matCache = new Map();
  const addMesh = async (meshIndex, matrix) => {
    for (const prim of json.meshes[meshIndex].primitives) {
      const geo = new THREE.BufferGeometry();
      const attrs = prim.attributes;
      geo.setAttribute("position", new THREE.BufferAttribute(accessorToArray(json, bin, attrs.POSITION), 3));
      if (attrs.NORMAL !== undefined) {
        geo.setAttribute("normal", new THREE.BufferAttribute(accessorToArray(json, bin, attrs.NORMAL), 3));
      }
      if (attrs.TEXCOORD_0 !== undefined) {
        geo.setAttribute("uv", new THREE.BufferAttribute(accessorToArray(json, bin, attrs.TEXCOORD_0), 2));
      }
      if (attrs.COLOR_0 !== undefined) {
        const col = accessorToArray(json, bin, attrs.COLOR_0);
        geo.setAttribute("color", new THREE.BufferAttribute(col, SIZE[json.accessors[attrs.COLOR_0].type]));
      }
      if (prim.indices !== undefined) {
        geo.setIndex(new THREE.BufferAttribute(accessorToArray(json, bin, prim.indices), 1));
      }
      if (attrs.NORMAL === undefined) geo.computeVertexNormals();
      let mat;
      if (prim.material !== undefined) {
        if (!matCache.has(prim.material)) matCache.set(prim.material, await materialFrom(json, bin, prim.material));
        mat = matCache.get(prim.material);
        if (geo.attributes.color) { mat = mat.clone(); mat.vertexColors = true; }
      } else {
        mat = new THREE.MeshStandardMaterial({ color: 0x9aa4b8, roughness: 0.8 });
      }
      const mesh = new THREE.Mesh(geo, mat);
      mesh.applyMatrix4(matrix);
      mesh.castShadow = true;
      group.add(mesh);
    }
  };
  const walk = async (nodeIndex, parent) => {
    const node = json.nodes[nodeIndex];
    const m = parent.clone().multiply(nodeMatrix(node));
    if (node.mesh !== undefined) await addMesh(node.mesh, m);
    for (const child of node.children || []) await walk(child, m);
  };
  const sceneDef = json.scenes?.[json.scene || 0];
  if (sceneDef) {
    for (const n of sceneDef.nodes) await walk(n, new THREE.Matrix4());
  } else if (json.meshes) {
    for (let i = 0; i < json.meshes.length; i++) await addMesh(i, new THREE.Matrix4());
  }

  if (targetSize) {
    const box = new THREE.Box3().setFromObject(group);
    const dim = new THREE.Vector3();
    box.getSize(dim);
    const scale = targetSize / Math.max(dim.x, dim.y, dim.z, 1e-6);
    group.scale.setScalar(scale);
    const center = new THREE.Vector3();
    box.getCenter(center);
    group.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
    const wrapper = new THREE.Group(); // bake recenter into a clean parent
    wrapper.add(group);
    return wrapper;
  }
  return group;
}
