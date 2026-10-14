"""Renders page 1 of every PDF in public/certificates/ to src/assets/certificates/<slug>.jpg.

Manual asset generator (like generate-og-images.mjs): run it after adding or replacing a
certificate PDF and commit the resulting images. Requires PyMuPDF: `pip install pymupdf`.

    python scripts/render-certificates.py
"""

from pathlib import Path

import pymupdf

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public" / "certificates"
OUT = ROOT / "src" / "assets" / "certificates"
WIDTH = 1600

OUT.mkdir(parents=True, exist_ok=True)
for pdf in sorted(SRC.glob("*.pdf")):
    page = pymupdf.open(pdf)[0]
    zoom = WIDTH / page.rect.width
    pix = page.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom), alpha=False)
    target = OUT / f"{pdf.stem}.jpg"
    pix.save(target, jpg_quality=90)
    print(f"{target.relative_to(ROOT)}  {pix.width}x{pix.height}")
