#!/usr/bin/env python3

"""Downscale oversized images in assets/img to web dimensions.

    python3 SCRIPTS/optimize-images.py [--apply]

Without --apply it only reports. The build's image budget lives in
SCRIPTS/check-performance.mjs and runs in CI with no dependencies; this script
is the local fix for anything that budget rejects, and needs Pillow.
"""

import sys
from pathlib import Path

from PIL import Image

MAX_WIDTH = 1600
MAX_BYTES = 900_000
QUALITY = 78
IMAGES = Path(__file__).resolve().parent.parent / "assets" / "img"

apply_changes = "--apply" in sys.argv
oversized = []

for path in sorted(IMAGES.iterdir()):
    if path.suffix.lower() not in {".jpg", ".jpeg", ".png"}:
        continue
    size = path.stat().st_size
    with Image.open(path) as image:
        width, height = image.size
        if width <= MAX_WIDTH and size <= MAX_BYTES:
            continue
        oversized.append((path.name, width, height, size))
        if not apply_changes:
            continue

        resized = image
        if width > MAX_WIDTH:
            resized = image.resize(
                (MAX_WIDTH, round(height * MAX_WIDTH / width)), Image.LANCZOS
            )
        if path.suffix.lower() == ".png":
            resized.save(path, optimize=True)
        else:
            resized.convert("RGB").save(path, quality=QUALITY, optimize=True, progressive=True)

    after = path.stat().st_size
    print(f"  {path.name}: {width}x{height} {size/1048576:.1f}MB -> "
          f"{min(width, MAX_WIDTH)}px {after/1048576:.1f}MB")

if not oversized:
    print("All images are within the web budget.")
elif not apply_changes:
    print(f"{len(oversized)} images exceed {MAX_WIDTH}px or {MAX_BYTES} bytes:")
    for name, width, height, size in oversized:
        print(f"  {name}: {width}x{height}, {size/1048576:.1f}MB")
    print("Re-run with --apply to downscale them.")
else:
    print(f"Optimized {len(oversized)} images.")
