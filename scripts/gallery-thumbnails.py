"""Optional gallery publishing step: build WebP previews with Pillow.

Called by node build-gallery-page.js --thumbnails with the published filenames.
"""
from pathlib import Path
import sys

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
source = ROOT / 'assets/images/gallery-page'
target = ROOT / 'assets/images/gallery-thumbs'
target.mkdir(exist_ok=True)
for file in sys.argv[1:]:
    original = source / file
    preview = target / (original.name + '.webp')
    if preview.exists() and preview.stat().st_mtime >= original.stat().st_mtime:
        continue
    with Image.open(original) as photo:
        image = ImageOps.exif_transpose(photo).convert('RGB')
        image.thumbnail((600, 720), Image.Resampling.LANCZOS)
        image.save(preview, 'WEBP', method=4, quality=78)
