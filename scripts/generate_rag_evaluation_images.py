#!/usr/bin/env python3
"""Generate local social images for the RAG evaluation guide."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "img" / "rag-evaluation-guide-og.png"
WIDTH = 1200
HEIGHT = 630


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    for candidate in candidates:
        path = Path(candidate)
        if path.exists():
            return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


def draw_rounded(draw: ImageDraw.ImageDraw, xy: tuple[int, int, int, int], fill: str, outline: str | None = None) -> None:
    draw.rounded_rectangle(xy, radius=28, fill=fill, outline=outline, width=2 if outline else 1)


def main() -> None:
    image = Image.new("RGB", (WIDTH, HEIGHT), "#f7faf9")
    draw = ImageDraw.Draw(image)

    draw.rectangle((0, 0, WIDTH, HEIGHT), fill="#f7faf9")
    draw.rectangle((0, 0, WIDTH, 18), fill="#0f766e")
    draw.rectangle((0, HEIGHT - 18, WIDTH, HEIGHT), fill="#f1780e")

    draw_rounded(draw, (72, 72, 1128, 558), "#ffffff", "#d7e3df")

    draw.text((120, 132), "RAG Evaluation Guide", font=font(70, bold=True), fill="#102a43")
    draw.text((124, 230), "Retrieval · Generation · Citations · Reliability", font=font(34), fill="#0f766e")

    stages = [
        ("Retriever", "Recall@K · Precision@K · MRR"),
        ("Evidence", "Freshness · authority · version match"),
        ("Generation", "Faithfulness · groundedness"),
        ("Operations", "Latency · cost · drift"),
    ]
    x = 124
    y = 325
    for title, subtitle in stages:
        draw_rounded(draw, (x, y, x + 220, y + 110), "#eef7f4", "#a7d6cc")
        draw.text((x + 22, y + 24), title, font=font(26, bold=True), fill="#0b5f59")
        draw.text((x + 22, y + 64), subtitle, font=font(18), fill="#263f4a")
        x += 244

    draw.text((124, 500), "Yangming Li / yangmingli.com", font=font(24, bold=True), fill="#4a5568")

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    image.save(OUTPUT, "PNG", optimize=True)
    print(f"Wrote {OUTPUT.relative_to(ROOT).as_posix()} ({WIDTH}x{HEIGHT})")


if __name__ == "__main__":
    main()
