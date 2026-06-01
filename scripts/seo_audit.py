#!/usr/bin/env python3
"""Static SEO validation for yangmingli.com.

Checks local HTML only. A passing run means:
- indexable pages have one title, description, canonical, and robots directive
- canonicals are unique for indexable pages
- local links/assets resolve
- JSON-LD parses
- sitemap URLs are canonical, indexable local pages
"""

from __future__ import annotations

import json
import re
import sys
import xml.etree.ElementTree as ET
from collections import Counter, defaultdict
from pathlib import Path
from urllib.parse import unquote, urlparse

from bs4 import BeautifulSoup


ROOT = Path(__file__).resolve().parents[1]
BASE_URL = "https://yangmingli.com"
EXCLUDE_DIRS = {".git", "__pycache__", "templates", "email-templates", "nha-cai"}
EXCLUDE_FILES = {"google6a208e5b3409387b.html", "readme.htm"}
EXPECTED_INDEX_ROBOTS = "index,follow,max-image-preview:large"


def rel_path(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def should_skip(path: Path) -> bool:
    parts = path.relative_to(ROOT).parts
    return (
        path.name in EXCLUDE_FILES
        or path.stat().st_size == 0
        or any(part in EXCLUDE_DIRS or part.startswith(".tmp-") for part in parts)
    )


def public_html_files() -> list[Path]:
    return sorted(path for path in ROOT.rglob("*.html") if not should_skip(path))


def page_url(path: Path) -> str:
    rel = rel_path(path)
    if rel == "index.html":
        return f"{BASE_URL}/"
    if rel.endswith("/index.html"):
        return f"{BASE_URL}/{rel[:-len('index.html')]}"
    return f"{BASE_URL}/{rel}"


def norm_url(url: str) -> str:
    cleaned = (url or "").strip()
    if cleaned in {BASE_URL, f"{BASE_URL}/"}:
        return f"{BASE_URL}/"
    return cleaned.rstrip("/")


def soup_for(path: Path) -> BeautifulSoup:
    return BeautifulSoup(path.read_text(encoding="utf-8", errors="ignore"), "html.parser")


def meta_values(soup: BeautifulSoup, name: str) -> list[str]:
    return [
        tag.get("content", "")
        for tag in soup.find_all("meta")
        if (tag.get("name") or "").lower() == name.lower()
    ]


def canonical_values(soup: BeautifulSoup) -> list[str]:
    values = []
    for tag in soup.find_all("link"):
        rels = tag.get("rel") or []
        rels = rels if isinstance(rels, list) else [rels]
        if any(str(rel).lower() == "canonical" for rel in rels):
            values.append(tag.get("href", ""))
    return values


def is_noindex(soup: BeautifulSoup) -> bool:
    for name in ("robots", "googlebot"):
        for content in meta_values(soup, name):
            if "noindex" in content.lower():
                return True
    return False


def local_target(value: str, current: Path) -> Path | None:
    if not value:
        return None
    parsed = urlparse(value)
    if parsed.scheme and parsed.scheme not in {"http", "https"}:
        return None
    if parsed.scheme in {"http", "https"} and parsed.netloc and parsed.netloc != "yangmingli.com":
        return None
    raw_path = unquote(parsed.path)
    if not raw_path:
        return None
    if raw_path.startswith("/"):
        target = ROOT / raw_path.lstrip("/")
    else:
        target = current.parent / raw_path
    if target.is_dir():
        target = target / "index.html"
    elif not target.suffix and (target / "index.html").exists():
        target = target / "index.html"
    return target


def validate_json_ld(soup: BeautifulSoup, rel: str, errors: list[str]) -> None:
    for idx, script in enumerate(soup.find_all("script", attrs={"type": re.compile(r"application/ld\+json", re.I)}), start=1):
        try:
            json.loads(script.string or script.get_text() or "")
        except json.JSONDecodeError as exc:
            errors.append(f"{rel}: invalid JSON-LD block {idx}: {exc}")


def weak_description(text: str, title: str) -> str | None:
    text_clean = re.sub(r"\s+", " ", text or "").strip()
    title_clean = re.sub(r"\s+", " ", title or "").strip()
    if not text_clean:
        return "empty meta description"
    if "light dark" in text_clean.lower():
        return "description contains UI words 'Light Dark'"
    if text_clean.lower() in {"by yangming li", "written by yangming li"}:
        return "description is only an author byline"
    if title_clean and text_clean.startswith(title_clean) and len(text_clean) - len(title_clean) < 45:
        return "description repeats title without useful summary"
    if len(text_clean) < 80:
        return f"description is very short ({len(text_clean)} chars)"
    return None


def audit_pages() -> tuple[list[str], list[str], dict[str, Path], set[str]]:
    errors: list[str] = []
    warnings: list[str] = []
    canonical_to_path: dict[str, Path] = {}
    indexable_urls: set[str] = set()
    description_counter: Counter[str] = Counter()
    description_owner: dict[str, str] = {}

    for path in public_html_files():
        rel = rel_path(path)
        soup = soup_for(path)
        noindex = is_noindex(soup)

        titles = [tag.get_text(" ", strip=True) for tag in soup.find_all("title")]
        descriptions = meta_values(soup, "description")
        canonicals = canonical_values(soup)
        robots = meta_values(soup, "robots")
        h1s = soup.find_all("h1")

        validate_json_ld(soup, rel, errors)

        if len(titles) != 1:
            errors.append(f"{rel}: expected exactly one <title>, found {len(titles)}")
        if len(canonicals) != 1:
            errors.append(f"{rel}: expected exactly one canonical, found {len(canonicals)}")
        elif not canonicals[0].startswith(f"{BASE_URL}/"):
            errors.append(f"{rel}: canonical must be absolute on {BASE_URL}: {canonicals[0]}")

        if not noindex:
            expected = norm_url(page_url(path))
            if len(canonicals) == 1 and norm_url(canonicals[0]) != expected:
                errors.append(f"{rel}: indexable page canonical {canonicals[0]} does not match expected {page_url(path)}")
            if len(robots) != 1:
                errors.append(f"{rel}: expected exactly one robots meta, found {len(robots)}")
            elif robots[0].replace(" ", "") != EXPECTED_INDEX_ROBOTS:
                errors.append(f"{rel}: robots must be '{EXPECTED_INDEX_ROBOTS}', found '{robots[0]}'")
            if len(descriptions) != 1:
                errors.append(f"{rel}: expected exactly one meta description, found {len(descriptions)}")
            else:
                reason = weak_description(descriptions[0], titles[0] if titles else "")
                if reason:
                    warnings.append(f"{rel}: {reason}")
                key = re.sub(r"\s+", " ", descriptions[0].strip().lower())
                description_counter[key] += 1
                description_owner.setdefault(key, rel)
            if len(h1s) != 1:
                errors.append(f"{rel}: expected exactly one H1, found {len(h1s)}")
            if len(canonicals) == 1:
                canon = norm_url(canonicals[0])
                if canon in canonical_to_path:
                    errors.append(f"{rel}: duplicate canonical also used by {rel_path(canonical_to_path[canon])}: {canonicals[0]}")
                canonical_to_path[canon] = path
                indexable_urls.add(canon)
        else:
            if len(robots) == 1 and "follow" not in robots[0].lower():
                warnings.append(f"{rel}: noindex page should generally keep follow")

        for tag in soup.find_all(["a", "link", "script", "img", "source", "video"]):
            attrs = ["href"] if tag.name in {"a", "link"} else ["src", "poster"]
            for attr in attrs:
                value = tag.get(attr)
                if not value or value.startswith(("#", "mailto:", "tel:", "javascript:", "data:")):
                    continue
                target = local_target(value, path)
                if target and not target.exists():
                    errors.append(f"{rel}: broken local {attr} '{value}'")

        for img in soup.find_all("img"):
            if img.get("aria-hidden", "").lower() == "true" or img.get("role") == "presentation":
                continue
            if img.get("alt") is None:
                errors.append(f"{rel}: image missing alt text for src '{img.get('src', '')}'")

    for desc, count in description_counter.items():
        if count > 1:
            warnings.append(f"duplicate meta description used {count} times, first seen on {description_owner[desc]}")

    return errors, warnings, canonical_to_path, indexable_urls


def audit_sitemap(indexable_urls: set[str]) -> list[str]:
    errors: list[str] = []
    sitemap = ROOT / "sitemap.xml"
    if not sitemap.exists():
        return ["sitemap.xml: missing"]

    try:
        tree = ET.parse(sitemap)
    except ET.ParseError as exc:
        return [f"sitemap.xml: invalid XML: {exc}"]

    ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    urls = [norm_url(loc.text or "") for loc in tree.findall(".//sm:loc", ns)]
    seen = Counter(urls)
    for url, count in seen.items():
        if count > 1:
            errors.append(f"sitemap.xml: duplicate URL {url}")

    sitemap_urls = set(urls)
    for url in sorted(sitemap_urls - indexable_urls):
        errors.append(f"sitemap.xml: URL is not a canonical indexable local page: {url}")
    for url in sorted(indexable_urls - sitemap_urls):
        errors.append(f"sitemap.xml: indexable canonical page missing: {url}")
    return errors


def audit_robots() -> list[str]:
    path = ROOT / "robots.txt"
    if not path.exists():
        return ["robots.txt: missing"]
    text = path.read_text(encoding="utf-8", errors="ignore")
    if "Sitemap: https://yangmingli.com/sitemap.xml" not in text:
        return ["robots.txt: missing correct Sitemap directive"]
    return []


def main() -> int:
    page_errors, warnings, _canonicals, indexable_urls = audit_pages()
    errors = page_errors + audit_sitemap(indexable_urls) + audit_robots()
    if warnings:
        print("SEO audit warnings:")
        for warning in warnings:
            print(f"- {warning}")
    if errors:
        print("SEO audit failed:")
        for error in errors:
            print(f"- {error}")
        return 1
    print(f"SEO audit passed for {len(indexable_urls)} indexable canonical pages.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
