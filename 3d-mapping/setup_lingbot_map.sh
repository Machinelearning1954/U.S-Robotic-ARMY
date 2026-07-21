#!/usr/bin/env bash
# Set up LingBot-Map (https://github.com/Robbyant/lingbot-map) for this project.
#
# Usage:
#   bash setup_lingbot_map.sh [checkpoint]
#
# checkpoint: lingbot-map (default) | lingbot-map-long | lingbot-map-stage1
set -euo pipefail

CHECKPOINT="${1:-lingbot-map}"
ENV_NAME="lingbot-map"
UPSTREAM_DIR="lingbot-map"
CKPT_DIR="checkpoints"

case "$CHECKPOINT" in
  lingbot-map|lingbot-map-long|lingbot-map-stage1) ;;
  *) echo "Unknown checkpoint '$CHECKPOINT' (expected lingbot-map, lingbot-map-long, or lingbot-map-stage1)" >&2
     exit 1 ;;
esac

echo "==> Creating conda environment '$ENV_NAME' (Python 3.10)"
if ! conda env list | grep -q "^${ENV_NAME} "; then
  conda create -n "$ENV_NAME" python=3.10 -y
fi
# shellcheck disable=SC1091
source "$(conda info --base)/etc/profile.d/conda.sh"
conda activate "$ENV_NAME"

echo "==> Installing PyTorch 2.8.0 (CUDA 12.8)"
pip install torch==2.8.0 torchvision==0.23.0 --index-url https://download.pytorch.org/whl/cu128

echo "==> Cloning LingBot-Map"
if [ ! -d "$UPSTREAM_DIR" ]; then
  git clone https://github.com/Robbyant/lingbot-map.git "$UPSTREAM_DIR"
fi

echo "==> Installing LingBot-Map + extras"
pip install -e "./$UPSTREAM_DIR"
pip install --index-url https://pypi.org/simple flashinfer-python || \
  echo "WARN: FlashInfer install failed; demo.py can fall back to --use_sdpa"
pip install -e "./$UPSTREAM_DIR[vis]" || \
  echo "WARN: visualization extras failed to install (viewer disabled)"
pip install onnxruntime || \
  echo "WARN: onnxruntime install failed; --mask_sky will be unavailable"

echo "==> Downloading checkpoint '$CHECKPOINT' from Hugging Face (robbyant/lingbot-map)"
pip install -U "huggingface_hub[cli]"
mkdir -p "$CKPT_DIR"
hf download robbyant/lingbot-map --include "*${CHECKPOINT}*" --local-dir "$CKPT_DIR"

echo
echo "Done. Checkpoint files are under ./$CKPT_DIR"
echo "Run:  conda activate $ENV_NAME && python run_reconstruction.py --video <video.mp4>"
