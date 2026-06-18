#!/usr/bin/env python3
"""Static SEO validation for yangmingli.com.

Checks local HTML only. A passing run means:
- indexable pages have one title, description, canonical, and robots directive
- canonicals are unique for indexable pages
- local links/assets resolve
- JSON-LD parses
- sitemap URLs are canonical, indexable local pages
- sitemap and crawlable internal links avoid known redirect source URLs
- indexable pages have inbound crawlable internal links, with explicit exceptions
- priority pages use local, resolvable social images
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
GENERIC_SOCIAL_IMAGES = {"/img/Logo.png", "/Logo.png"}
ORPHAN_WARNING_EXCEPTIONS = {
    # The homepage is the crawl root; it does not need another local page to
    # justify discovery even if a future redesign removes home links.
    f"{BASE_URL}/",
    # Post-download confirmation page reached after the checklist flow.
    f"{BASE_URL}/thank-you-ai-agent-checklist.html",
}
PRIORITY_SOCIAL_IMAGE_URLS = {
    f"{BASE_URL}/",
    f"{BASE_URL}/ai-engineering/",
    f"{BASE_URL}/blog/",
    f"{BASE_URL}/llm-evaluation/",
    f"{BASE_URL}/rag-evaluation-not-a-score.html",
}
PRIORITY_ARTICLE_URLS = {
    f"{BASE_URL}/rag-evaluation-not-a-score.html",
    f"{BASE_URL}/ai-agents-evaluation-not-prompting.html",
    f"{BASE_URL}/testing-evaluating-copilot-agents.html",
    f"{BASE_URL}/uqlm-teaching-guide.html",
}


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


def absolute_internal_url(value: str, current: Path) -> str | None:
    """Resolve local or yangmingli.com URLs to absolute URLs without fragments."""
    if not value or value.startswith(("#", "mailto:", "tel:", "javascript:", "data:")):
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
        path = raw_path
    else:
        base = "/" + rel_path(current.parent).strip("/")
        if base == "/.":
            base = "/"
        path = str(Path(base) / raw_path).replace("\\", "/")
        if not path.startswith("/"):
            path = f"/{path}"
    return norm_url(f"{BASE_URL}{path}")


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


def local_site_image_path(value: str) -> Path | None:
    """Return a local filesystem path for relative or yangmingli.com image URLs."""
    if not value:
        return None
    parsed = urlparse(value)
    if parsed.scheme in {"http", "https"}:
        if parsed.netloc != "yangmingli.com":
            return None
        raw_path = unquote(parsed.path)
    elif parsed.scheme:
        return None
    else:
        raw_path = unquote(parsed.path)

    if not raw_path:
        return None
    return ROOT / raw_path.lstrip("/")


def social_image_values(soup: BeautifulSoup) -> dict[str, list[str]]:
    """Collect Open Graph and Twitter image URLs from a page."""
    values: dict[str, list[str]] = {"og:image": [], "twitter:image": []}
    for tag in soup.find_all("meta"):
        prop = (tag.get("property") or "").lower()
        name = (tag.get("name") or "").lower()
        content = tag.get("content") or ""
        if prop == "og:image":
            values["og:image"].append(content)
        if name == "twitter:image":
            values["twitter:image"].append(content)
    return values


def load_redirect_sources() -> dict[str, str]:
    """Load redirect sources from Vercel and Netlify-style redirect config."""
    redirects: dict[str, str] = {}

    vercel = ROOT / "vercel.json"
    if vercel.exists():
        try:
            data = json.loads(vercel.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            data = {}
        for item in data.get("redirects", []):
            source = item.get("source")
            destination = item.get("destination", "")
            if source:
                redirects[norm_url(f"{BASE_URL}{source}")] = destination

    redirects_file = ROOT / "_redirects"
    if redirects_file.exists():
        for line in redirects_file.read_text(encoding="utf-8", errors="ignore").splitlines():
            stripped = line.strip()
            if not stripped or stripped.startswith("#"):
                continue
            parts = stripped.split()
            if len(parts) >= 3 and parts[2].startswith("301") and parts[0].startswith("/"):
                redirects[norm_url(f"{BASE_URL}{parts[0]}")] = parts[1]

    return redirects


def audit_social_images(
    soup: BeautifulSoup,
    rel: str,
    url: str,
    warnings: list[str],
) -> None:
    """Warn when priority pages have missing or generic social images."""
    if url not in PRIORITY_SOCIAL_IMAGE_URLS and url not in PRIORITY_ARTICLE_URLS:
        return

    images = social_image_values(soup)
    for field, values in images.items():
        if len(values) != 1:
            warnings.append(f"{rel}: expected exactly one {field}, found {len(values)}")
            continue
        image_path = local_site_image_path(values[0])
        if image_path and not image_path.exists():
            warnings.append(f"{rel}: {field} points to missing local image {values[0]}")

    normalized_paths = {
        urlparse(value).path
        for values in images.values()
        for value in values
    }
    if url in PRIORITY_ARTICLE_URLS and normalized_paths & GENERIC_SOCIAL_IMAGES:
        warnings.append(f"{rel}: priority article uses a generic social image")


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


def audit_pages(redirect_sources: dict[str, str]) -> tuple[list[str], list[str], dict[str, Path], set[str]]:
    errors: list[str] = []
    warnings: list[str] = []
    canonical_to_path: dict[str, Path] = {}
    indexable_urls: set[str] = set()
    description_counter: Counter[str] = Counter()
    description_owner: dict[str, str] = {}
    link_edges: list[tuple[str, str]] = []

    for path in public_html_files():
        rel = rel_path(path)
        soup = soup_for(path)
        noindex = is_noindex(soup)
        source_url = norm_url(page_url(path))

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
                audit_social_images(soup, rel, canon, warnings)
        else:
            if len(robots) == 1 and "follow" not in robots[0].lower():
                warnings.append(f"{rel}: noindex page should generally keep follow")

        for tag in soup.find_all(["a", "link", "script", "img", "source", "video"]):
            attrs = ["href"] if tag.name in {"a", "link"} else ["src", "poster"]
            for attr in attrs:
                value = tag.get(attr)
                if not value or value.startswith(("#", "mailto:", "tel:", "javascript:", "data:")):
                    continue
                internal_url = absolute_internal_url(value, path)
                if tag.name == "a" and internal_url:
                    if internal_url in redirect_sources:
                        errors.append(f"{rel}: internal link points to redirect source '{value}'")
                    link_edges.append((source_url, internal_url))
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

    inbound_counts: Counter[str] = Counter()
    for source_url, target_url in link_edges:
        if target_url in indexable_urls and source_url != target_url:
            inbound_counts[target_url] += 1

    for url in sorted(indexable_urls):
        if url not in ORPHAN_WARNING_EXCEPTIONS and inbound_counts[url] == 0:
            path = canonical_to_path.get(url)
            label = rel_path(path) if path else url
            warnings.append(f"{label}: indexable page has no inbound crawlable internal links")

    return errors, warnings, canonical_to_path, indexable_urls


def audit_sitemap(indexable_urls: set[str], redirect_sources: dict[str, str]) -> list[str]:
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
        if url in redirect_sources:
            errors.append(f"sitemap.xml: URL is a known redirect source: {url}")

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
    redirect_sources = load_redirect_sources()
    page_errors, warnings, _canonicals, indexable_urls = audit_pages(redirect_sources)
    errors = page_errors + audit_sitemap(indexable_urls, redirect_sources) + audit_robots()
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
