import re
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(".")
BASE_URL = "https://yangmingli.com"
EXCLUDE_DIRS = {"admin", "private", ".git", "templates", "email-templates"}
EXCLUDE_FILES = {"google6a208e5b3409387b.html", "readme.htm"}
EXCLUDE_PATHS = {Path("focus-room/v1/index.html")}
CANONICAL_RE = re.compile(r'<link[^>]+rel=["\']canonical["\'][^>]+href=["\']([^"\']+)["\']', re.IGNORECASE)
ROBOTS_RE = re.compile(r'<meta[^>]+name=["\'](?:robots|googlebot)["\'][^>]+content=["\']([^"\']+)["\']', re.IGNORECASE)


def is_excluded(path: Path) -> bool:
    if path.name in EXCLUDE_FILES or path in EXCLUDE_PATHS:
        return True

    for part in path.parts:
        if part in EXCLUDE_DIRS or part.startswith(".tmp-"):
            return True

    return False


def get_lastmod(path: Path) -> str:
    dt = datetime.fromtimestamp(path.stat().st_mtime, tz=timezone.utc)
    return dt.strftime("%Y-%m-%dT%H:%M:%SZ")


def build_url(path: Path) -> str:
    rel_path = path.relative_to(ROOT).as_posix()

    if rel_path == "index.html":
        return f"{BASE_URL}/"

    if rel_path.endswith("/index.html"):
        return f"{BASE_URL}/{rel_path[:-len('index.html')]}"

    return f"{BASE_URL}/{rel_path}"


def normalize_url(url: str) -> str:
    cleaned = url.strip()
    if cleaned in {BASE_URL, f"{BASE_URL}/"}:
        return f"{BASE_URL}/"
    return cleaned.rstrip("/")


def read_html(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="ignore")


def is_noindex(html: str) -> bool:
    return any("noindex" in content.lower() for content in ROBOTS_RE.findall(html))


def canonical_points_elsewhere(html: str, expected_url: str) -> bool:
    match = CANONICAL_RE.search(html)
    if not match:
        return False

    return normalize_url(match.group(1)) != normalize_url(expected_url)


def should_include(path: Path) -> bool:
    if is_excluded(path):
        return False

    if path.stat().st_size == 0:
        return False

    html = read_html(path)
    expected_url = build_url(path)

    if is_noindex(html):
        return False

    if canonical_points_elsewhere(html, expected_url):
        return False

    return True


def iter_urls():
    html_files = sorted(
        ROOT.rglob("*.html"),
        key=lambda path: (path.relative_to(ROOT).as_posix() != "index.html", path.as_posix()),
    )

    for path in html_files:
        if should_include(path):
            yield build_url(path), get_lastmod(path)


def main() -> None:
    urls = list(iter_urls())
    sitemap_lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]

    for url, lastmod in urls:
        sitemap_lines.append("  <url>")
        sitemap_lines.append(f"    <loc>{url}</loc>")
        sitemap_lines.append(f"    <lastmod>{lastmod}</lastmod>")
        sitemap_lines.append("  </url>")

    sitemap_lines.append("</urlset>")
    (ROOT / "sitemap.xml").write_text("\n".join(sitemap_lines), encoding="utf-8")

    print(f"Generated {len(urls)} sitemap URLs.")


if __name__ == "__main__":
    main()
