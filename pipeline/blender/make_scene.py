# Builds scene.blend: the Rolling Calf (YARDCLASH Beast Night form, original folklore
# design) on a turntable — 24-frame loop, camera + key light, ready for `blender -b -a`.
import bpy, math

# clean slate
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = 'BLENDER_EEVEE_NEXT' if hasattr(bpy.types, 'SceneEEVEENext') else 'BLENDER_EEVEE'
sc.render.resolution_x, sc.render.resolution_y = 640, 480
sc.frame_start, sc.frame_end = 1, 24

def box(name, size, loc, col):
    bpy.ops.mesh.primitive_cube_add(location=loc)
    o = bpy.context.object; o.name = name
    o.scale = (size[0]/2, size[1]/2, size[2]/2)
    m = bpy.data.materials.new(name+'_m'); m.diffuse_color = col
    m.use_nodes = True
    m.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = col
    o.data.materials.append(m)
    return o

rig = bpy.data.objects.new('calf_rig', None); bpy.context.collection.objects.link(rig)
dark = (0.03,0.035,0.045,1); bone=(0.85,0.82,0.75,1); red=(1.0,0.08,0.08,1); steel=(0.55,0.6,0.65,1)
parts = [
    box('body', (1.5,0.95,1.1), (0,0,1.0), dark),
    box('head', (0.7,0.6,0.6), (0.95,0,1.5), dark),
    box('hornL', (0.5,0.09,0.09), (1.25,0.28,1.95), bone),
    box('hornR', (0.5,0.09,0.09), (1.25,-0.28,1.95), bone),
    box('eyeL', (0.09,0.07,0.07), (1.32,0.2,1.55), red),
    box('eyeR', (0.09,0.07,0.07), (1.32,-0.2,1.55), red),
    box('chain', (1.4,0.06,0.06), (-0.7,0,0.5), steel),
]
for i,(dx,dy) in enumerate([(0.55,0.35),(0.55,-0.35),(-0.55,0.35),(-0.55,-0.35)]):
    parts.append(box(f'leg{i}', (0.22,0.22,0.9), (dx,dy,0.45), dark))
for p in parts: p.parent = rig

# glowing eyes
for n in ('eyeL','eyeR'):
    m = bpy.data.objects[n].data.materials[0]
    bsdf = m.node_tree.nodes['Principled BSDF']
    if 'Emission Color' in bsdf.inputs: bsdf.inputs['Emission Color'].default_value = red
    if 'Emission Strength' in bsdf.inputs: bsdf.inputs['Emission Strength'].default_value = 8.0

# turntable animation
rig.rotation_euler = (0,0,0); rig.keyframe_insert('rotation_euler', frame=1)
rig.rotation_euler = (0,0,math.tau); rig.keyframe_insert('rotation_euler', frame=24)
for f in rig.animation_data.action.fcurves:
    for k in f.keyframe_points: k.interpolation = 'LINEAR'

# ground, camera, lights
bpy.ops.mesh.primitive_plane_add(size=30, location=(0,0,0))
g = bpy.context.object; gm = bpy.data.materials.new('ground'); gm.use_nodes=True
gm.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (0.02,0.07,0.06,1)
g.data.materials.append(gm)
bpy.ops.object.camera_add(location=(4.2,-4.2,2.6), rotation=(math.radians(70),0,math.radians(45)))
sc.camera = bpy.context.object
bpy.ops.object.light_add(type='AREA', location=(3,-2,5)); bpy.context.object.data.energy=800
bpy.context.object.data.color=(0.65,0.95,0.88)
bpy.ops.object.light_add(type='POINT', location=(-3,3,2)); bpy.context.object.data.energy=200
bpy.context.object.data.color=(1.0,0.45,0.75)
sc.world = bpy.data.worlds.new('w'); sc.world.use_nodes=True
sc.world.node_tree.nodes['Background'].inputs[0].default_value=(0.008,0.02,0.03,1)

bpy.ops.wm.save_as_mainfile(filepath=bpy.path.abspath('//scene.blend'))
print('scene.blend written')
