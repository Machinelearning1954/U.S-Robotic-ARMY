#!/usr/bin/env python3
"""Generate a 3D model with the Tripo3D API and install it as a game asset.

Tripo3D (https://studio.tripo3d.ai) turns text prompts or images into 3D
models. This script drives its REST API (https://platform.tripo3d.ai):
creates a generation task, polls until it finishes, downloads the GLB, and —
with --role — drops it into game/models/ and updates manifest.json so the
game uses it immediately.

Setup:
    Get an API key at https://platform.tripo3d.ai and export TRIPO_API_KEY.

Examples (run from the repo root):
    python tripo_integration/generate_asset.py \
        --prompt "quadruped military robot, olive drab armor, game asset" --role unit

    python tripo_integration/generate_asset.py \
        --prompt "menacing red combat quadcopter drone" --role drone

    python tripo_integration/generate_asset.py --image photo_of_robot.jpg --role unit

    python tripo_integration/generate_asset.py --prompt "radio antenna tower" \
        --out my_tower.glb        # just download, don't touch the game

No third-party dependencies (stdlib urllib only).
"""

import argparse
import json
import mimetypes
import os
import sys
import time
import urllib.error
import urllib.request
import uuid

API_BASE = "https://api.tripo3d.ai/v2/openapi"
GAME_MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "game", "models")


def api_key():
    key = os.environ.get("TRIPO_API_KEY")
    if not key:
        sys.exit("error: set TRIPO_API_KEY (create a key at https://platform.tripo3d.ai)")
    return key


def api_request(method, path, body=None, raw_body=None, content_type="application/json"):
    url = API_BASE + path
    data = raw_body if raw_body is not None else (json.dumps(body).encode() if body else None)
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Authorization", f"Bearer {api_key()}")
    if data is not None:
        req.add_header("Content-Type", content_type)
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            payload = json.load(resp)
    except urllib.error.HTTPError as e:
        detail = e.read().decode(errors="replace")[:500]
        sys.exit(f"error: Tripo API {method} {path} -> HTTP {e.code}: {detail}")
    except urllib.error.URLError as e:
        sys.exit(f"error: cannot reach Tripo API ({e.reason})")
    if payload.get("code") not in (0, None):
        sys.exit(f"error: Tripo API returned code {payload.get('code')}: {payload.get('message')}")
    return payload.get("data", payload)


def upload_image(path):
    """Multipart upload; returns an image token for image_to_model."""
    boundary = uuid.uuid4().hex
    ctype = mimetypes.guess_type(path)[0] or "application/octet-stream"
    with open(path, "rb") as f:
        content = f.read()
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="{os.path.basename(path)}"\r\n'
        f"Content-Type: {ctype}\r\n\r\n"
    ).encode() + content + f"\r\n--{boundary}--\r\n".encode()
    data = api_request("POST", "/upload", raw_body=body,
                       content_type=f"multipart/form-data; boundary={boundary}")
    token = data.get("image_token") or data.get("file_token") or data.get("token")
    if not token:
        sys.exit(f"error: upload succeeded but no token in response: {data}")
    print(f"uploaded {path}")
    return token, os.path.splitext(path)[1].lstrip(".").lower() or "jpg"


def create_task(args):
    if args.image:
        token, ext = upload_image(args.image)
        body = {"type": "image_to_model", "file": {"type": ext, "file_token": token}}
    else:
        body = {"type": "text_to_model", "prompt": args.prompt}
    if args.model_version:
        body["model_version"] = args.model_version
    data = api_request("POST", "/task", body=body)
    task_id = data.get("task_id")
    if not task_id:
        sys.exit(f"error: no task_id in response: {data}")
    print(f"task created: {task_id}")
    return task_id


def poll_task(task_id, timeout_s=900):
    start = time.time()
    last = None
    while time.time() - start < timeout_s:
        data = api_request("GET", f"/task/{task_id}")
        status = str(data.get("status", "")).lower()
        progress = data.get("progress")
        if (status, progress) != last:
            print(f"  status: {status}" + (f" ({progress}%)" if progress is not None else ""))
            last = (status, progress)
        if status in ("success", "finished"):
            return data
        if status in ("failed", "banned", "expired", "cancelled", "unknown"):
            sys.exit(f"error: task ended with status '{status}': {json.dumps(data)[:500]}")
        time.sleep(5)
    sys.exit(f"error: task {task_id} did not finish within {timeout_s}s")


def model_url_from(data):
    """Find the GLB URL across Tripo response shapes (output/result, pbr or base)."""
    for container in (data.get("output"), data.get("result"), data):
        if not isinstance(container, dict):
            continue
        for key in ("pbr_model", "model"):
            v = container.get(key)
            if isinstance(v, str) and v.startswith("http"):
                return v
            if isinstance(v, dict) and str(v.get("url", "")).startswith("http"):
                return v["url"]
    sys.exit(f"error: no model URL in finished task: {json.dumps(data)[:500]}")


def download(url, out_path):
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req, timeout=300) as resp, open(out_path, "wb") as f:
        while True:
            chunk = resp.read(1 << 16)
            if not chunk:
                break
            f.write(chunk)
    size = os.path.getsize(out_path)
    print(f"downloaded {out_path} ({size / 1e6:.1f} MB)")


def install_role(glb_path, role):
    manifest_path = os.path.join(GAME_MODELS_DIR, "manifest.json")
    with open(manifest_path) as f:
        manifest = json.load(f)
    if role not in manifest.get("models", {}):
        sys.exit(f"error: unknown role '{role}' (choose from {list(manifest['models'])})")
    manifest["models"][role]["file"] = os.path.basename(glb_path)
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)
        f.write("\n")
    print(f"manifest updated: {role} -> {os.path.basename(glb_path)}")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    src = ap.add_mutually_exclusive_group(required=True)
    src.add_argument("--prompt", help="Text prompt for text_to_model")
    src.add_argument("--image", help="Image file for image_to_model")
    ap.add_argument("--role", choices=["unit", "drone", "objective"],
                    help="Install into game/models/ as this role and update manifest.json")
    ap.add_argument("--out", help="Output .glb path (default: game/models/<role>.glb)")
    ap.add_argument("--model-version", help="Optional Tripo model version override")
    args = ap.parse_args()

    if not args.role and not args.out:
        sys.exit("error: pass --role (install into the game) and/or --out <file.glb>")

    task_id = create_task(args)
    data = poll_task(task_id)
    url = model_url_from(data)

    out_path = args.out or os.path.join(GAME_MODELS_DIR, f"{args.role}.glb")
    os.makedirs(os.path.dirname(os.path.abspath(out_path)), exist_ok=True)
    download(url, out_path)  # Tripo result URLs expire (~24 h), so fetch now

    if args.role:
        if not args.out:
            pass  # already in game/models/
        elif os.path.dirname(os.path.abspath(args.out)) != os.path.abspath(GAME_MODELS_DIR):
            import shutil
            shutil.copy(args.out, os.path.join(GAME_MODELS_DIR, os.path.basename(args.out)))
        install_role(out_path, args.role)
        print("done — serve the repo and reload the game to see the new model")


if __name__ == "__main__":
    main()
