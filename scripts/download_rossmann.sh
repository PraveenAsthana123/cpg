#!/usr/bin/env bash
# download_rossmann.sh — fetch the Rossmann Store Sales dataset.
# Uses Kaggle CLI if credentials are present; otherwise prints instructions.
set -euo pipefail

DEST="${1:-data/kaggle/rossmann}"
mkdir -p "$DEST"

if [[ -f "$DEST/train.csv" && -f "$DEST/store.csv" ]]; then
  echo "[download_rossmann] files already present in $DEST — skipping"
  exit 0
fi

if ! command -v kaggle >/dev/null 2>&1; then
  echo "[download_rossmann] kaggle CLI not installed. Install with: pip install kaggle"
  echo "Then set KAGGLE_USERNAME and KAGGLE_KEY in your env or ~/.kaggle/kaggle.json"
  exit 1
fi

if [[ -z "${KAGGLE_USERNAME:-}" || -z "${KAGGLE_KEY:-}" ]]; then
  if [[ ! -f "${HOME}/.kaggle/kaggle.json" ]]; then
    echo "[download_rossmann] no Kaggle credentials found"
    echo "Set KAGGLE_USERNAME and KAGGLE_KEY env vars, or place kaggle.json in ~/.kaggle/"
    exit 1
  fi
fi

echo "[download_rossmann] downloading rossmann-store-sales to $DEST"
kaggle competitions download -c rossmann-store-sales -p "$DEST"

cd "$DEST"
if ls *.zip >/dev/null 2>&1; then
  for z in *.zip; do
    unzip -o "$z"
    rm "$z"
  done
fi

echo "[download_rossmann] done. Files in $DEST:"
ls -lh "$DEST"
