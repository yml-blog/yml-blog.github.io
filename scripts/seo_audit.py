#!/usr/bin/env python3
"""Static SEO and crawlability checks for yangmingli.com."""

from __future__ import annotations

import json
import re
import sys
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parents[1]
BASE_URL = "https://yangmingli.com"
EXCLUDE_DIRS = {".git", "admin", "private", "templates", "email-templates", "nha-cai", "__pycache__"}
EXCLUDE_FILES = {"google6a208e5b3409387b.html", "readme.htm"}


class TagCollector(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.tags: list[tuple[str, dict[str, str]]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self.tags.append((tag.lower(), {k.lower(): v or "" for k, v in attrs}))

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self.handle_starttag(tag, attrs)


def rel_path(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def should_skip_path(path: Path) -> bool:
    if path.name in EXCLUDE_FILES or path.stat().st_size == 0:
        return True
    return any(part in EXCLUDE_DIRS or part.startswith(".tmp-") for part in path.relative_to(ROOT).parts)


def public_html_files() -> list[Path]:
    return sorted(path for path in ROOT.rglob("*.html") if not should_skip_path(path))


def page_url(path: Path) -> str:
    rel = rel_path(path)
    if rel == "index.html":
        return f"{BASE_URL}/"
    if rel.endswith("/index.html"):
        return f"{BASE_URL}/{rel[:-len('index.html')]}"
    return f"{BASE_URL}/{rel}"


def local_url_to_path(url: str, current: Path) -> Path | None:
    parsed = urlparse(url)
    if parsed.scheme and parsed.netloc and parsed.netloc != "yangmingli.com":
        return None
    if parsed.scheme and parsed.scheme not in {"http", "https"}:
        return None
    if url.startswith(("mailto:", "tel:", "javascript:", "data:", "#")):
        return None

    raw_path = unquote(parsed.path)
    if not raw_path:
        raw_path = "/"

    if raw_path.startswith("/"):
        target = ROOT / raw_path.lstrip("/")
    else:
        target = current.parent / raw_path

    if target.is_dir():
        target = target / "index.html"
    elif not target.suffix and (target / "index.html").exists():
        target = target / "index.html"

    return target.resolve()


def has_noindex(tags: list[tuple[str, dict[str, str]]]) -> bool:
    for tag, attrs in tags:
        if tag == "meta" and attrs.get("name", "").lower() in {"robots", "googlebot"}:
            if "noindex" in attrs.get("content", "").lower():
                return True
    return False


def collect_json_ld(html: str) -> list[str]:
    pattern = re.compile(
        r'<script\b[^>]*type=["\']application/ld\+json["\'][^>]*>([\s\S]*?)</script>',
        re.IGNORECASE,
    )
    return [match.group(1).strip() for match in pattern.finditer(html)]


def audit_pages() -> list[str]:
    errors: list[str] = []
    canonical_seen: dict[str, str] = {}

    for path in public_html_files():
        html = path.read_text(encoding="utf-8", errors="ignore")
        parser = TagCollector()
        parser.feed(html)
        tags = parser.tags
        indexable = not has_noindex(tags)

        titles = re.findall(r"<title\b[^>]*>[\s\S]*?</title>", html, flags=re.IGNORECASE)
        descriptions = [
            attrs.get("content", "")
            for tag, attrs in tags
            if tag == "meta" and attrs.get("name", "").lower() == "description"
        ]
        canonicals = [
            attrs.get("href", "")
            for tag, attrs in tags
            if tag == "link" and attrs.get("rel", "").lower() == "canonical"
        ]

        if indexable:
            if len(titles) != 1:
                errors.append(f"{rel_path(path)}: expected exactly one <title>, found {len(titles)}")
            if len(descriptions) != 1 or not descriptions[0].strip():
                errors.append(f"{rel_path(path)}: expected exactly one non-empty meta description")
            if len(canonicals) != 1:
                errors.append(f"{rel_path(path)}: expected exactly one canonical, found {len(canonicals)}")
            elif not canonicals[0].startswith(f"{BASE_URL}/"):
                errors.append(f"{rel_path(path)}: canonical must be an absolute {BASE_URL} URL")

            og_required = {"og:title", "og:description", "og:url", "og:image"}
            og_found = {
                attrs.get("property", "").lower()
                for tag, attrs in tags
                if tag == "meta" and attrs.get("property", "").lower().startswith("og:")
            }
            for prop in sorted(og_required - og_found):
                errors.append(f"{rel_path(path)}: missing {prop}")
            if not any(tag == "meta" and attrs.get("name", "").lower() == "twitter:card" for tag, attrs in tags):
                errors.append(f"{rel_path(path)}: missing twitter:card")

        if indexable:
            for canonical in canonicals:
                if canonical in canonical_seen:
                    errors.append(f"{rel_path(path)}: duplicate canonical also used by {canonical_seen[canonical]}")
                canonical_seen[canonical] = rel_path(path)

        for i, block in enumerate(collect_json_ld(html), start=1):
            try:
                json.loads(block)
            except json.JSONDecodeError as exc:
                errors.append(f"{rel_path(path)}: invalid JSON-LD block {i}: {exc}")

        for tag, attrs in tags:
            for attr in ("href", "src", "poster"):
                value = attrs.get(attr)
                if not value:
                    continue
                target = local_url_to_path(value, path)
                if target and not target.exists():
                    errors.append(f"{rel_path(path)}: broken local {attr} {value}")

        for tag, attrs in tags:
            if tag == "link" and attrs.get("rel", "").lower() == "alternate" and attrs.get("hreflang"):
                target = local_url_to_path(attrs.get("href", ""), path)
                if target and not target.exists():
                    errors.append(f"{rel_path(path)}: hreflang target does not exist: {attrs.get('href')}")

    return errors


def audit_sitemap() -> list[str]:
    errors: list[str] = []
    sitemap = ROOT / "sitemap.xml"
    try:
        tree = ET.parse(sitemap)
    except ET.ParseError as exc:
        return [f"sitemap.xml: invalid XML: {exc}"]

    ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    urls = [loc.text.strip() for loc in tree.findall(".//sm:loc", ns) if loc.text]
    if len(urls) != len(set(urls)):
        errors.append("sitemap.xml: duplicate URLs found")

    noindex_urls: set[str] = set()
    existing_urls = {page_url(path) for path in public_html_files()}
    for path in public_html_files():
        parser = TagCollector()
        parser.feed(path.read_text(encoding="utf-8", errors="ignore"))
        if has_noindex(parser.tags):
            noindex_urls.add(page_url(path))

    for url in urls:
        if url not in existing_urls:
            errors.append(f"sitemap.xml: URL has no existing public HTML file: {url}")
        if url in noindex_urls:
            errors.append(f"sitemap.xml: noindex URL included: {url}")

    return errors


def main() -> int:
    errors = audit_pages() + audit_sitemap()
    if errors:
        print("SEO audit failed:")
        for error in errors:
            print(f"- {error}")
        return 1
    print("SEO audit passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
