#!/usr/bin/env python3
"""Clean high-impact static SEO issues without changing page content structure."""

from __future__ import annotations

import re
from pathlib import Path

from bs4 import BeautifulSoup


ROOT = Path(".")
BASE_URL = "https://yangmingli.com"
EXCLUDE_DIRS = {".git", "templates", "email-templates", "__pycache__"}
EXCLUDE_FILES = {"google6a208e5b3409387b.html"}
EXCLUDE_PATHS = {Path("focus-room/v1/index.html"), Path("nha-cai/10439/08249712.html")}


TITLE_OVERRIDES = {
    "index.html": "Yangming Li | Applied AI Systems, Data Science, and Workflow Automation",
    "blog/index.html": "Blog | Yangming Li on AI, Data Science, Product, and Engineering",
    "about.html": "About Yangming Li | Applied AI and Data Product Builder",
    "projects.html": "Projects | Applied AI, Data Products, and Experiment Infrastructure",
    "contact.html": "Contact Yangming Li | AI, Data Science, and Product Work",
    "resume.html": "Resume | Yangming Li, AI Engineer and Product Builder",
}

DESCRIPTION_OVERRIDES = {
    "index.html": "Yangming Li builds applied AI systems for real-world workflows, with work across LLM systems, statistical ML, data engineering, data products, and experiment infrastructure.",
    "blog/index.html": "Browse Yangming Li's articles on applied AI, data science, NLP, MLOps, product systems, workflow automation, and engineering practice.",
    "about.html": "Learn about Yangming Li's work across applied AI, LLM systems, statistical ML, data engineering, data products, and experiment infrastructure.",
    "projects.html": "Explore Yangming Li's selected project themes in applied AI, document workflows, data products, MLOps, A/B testing, and workflow automation.",
    "contact.html": "Contact Yangming Li for conversations about applied AI systems, data science, product analytics, automation, and technical collaboration.",
    "resume.html": "A concise resume-style overview of Yangming Li's applied AI, data science, product, engineering, and analytics focus areas.",
}


def is_excluded(path: Path) -> bool:
    rel = path.relative_to(ROOT)
    if rel.name in EXCLUDE_FILES or rel in EXCLUDE_PATHS:
        return True
    return any(part in EXCLUDE_DIRS or part.startswith(".tmp-") for part in rel.parts)


def canonical_for(path: Path) -> str:
    rel = path.relative_to(ROOT).as_posix()
    if rel == "index.html":
        return f"{BASE_URL}/"
    if rel == "product/index.html":
        return f"{BASE_URL}/blog/"
    if rel.endswith("/index.html"):
        return f"{BASE_URL}/{rel[:-len('index.html')]}"
    return f"{BASE_URL}/{rel}"


def clean_title(raw: str, fallback: str, rel: str) -> str:
    if rel in TITLE_OVERRIDES:
        return TITLE_OVERRIDES[rel]
    title = re.sub(r"\s+\|\s+Yangming Li.*$", "", raw or "", flags=re.I).strip()
    title = title.replace(" - Yangming's Blog", "").replace("Yangming's Blog", "").strip(" |")
    if "..." in title and fallback:
        title = fallback.strip()
    if not title:
        title = fallback or "Yangming Li"
    if "Yangming Li" not in title:
        title = f"{title} | Yangming Li"
    return title


def normalize_space(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def summarize(soup: BeautifulSoup, rel: str) -> str:
    if rel in DESCRIPTION_OVERRIDES:
        return DESCRIPTION_OVERRIDES[rel]
    text = normalize_space(soup.get_text(" "))
    text = re.sub(r"Table of Contents.*?(?=\b[A-Z][a-z])", "", text)
    text = text.replace("By Yangming Li", "").strip()
    if len(text) > 158:
        text = text[:158].rsplit(" ", 1)[0].rstrip(".,;:") + "."
    return text or "Yangming Li shares practical notes on applied AI, data science, product thinking, and engineering systems."


def should_replace_description(desc: str) -> bool:
    value = normalize_space(desc)
    return (
        not value
        or value == "By Yangming Li..."
        or len(value) < 50
        or value.endswith("...")
        or "ç" in value
        or "å" in value
        or "æ" in value
    )


def upsert_meta(soup: BeautifulSoup, attr_name: str, attr_value: str, content: str, tag_attr: str = "name") -> None:
    tag = soup.find("meta", attrs={tag_attr: attr_name})
    if tag is None:
        tag = soup.new_tag("meta")
        tag[tag_attr] = attr_name
        soup.head.append(tag)
    tag["content"] = content


def clean_file(path: Path) -> bool:
    rel = path.relative_to(ROOT).as_posix()
    soup = BeautifulSoup(path.read_text(encoding="utf-8", errors="ignore"), "html.parser")
    if soup.head is None:
        return False

    changed = False

    for tag in soup.find_all("meta", attrs={"name": re.compile(r"^keywords$", re.I)}):
        tag.decompose()
        changed = True

    for tag in soup.find_all("link", rel=lambda rels: rels and "canonical" in rels):
        tag.decompose()
        changed = True
    canonical = soup.new_tag("link", rel="canonical", href=canonical_for(path))
    soup.head.append(canonical)

    for tag in soup.find_all("link", rel=lambda rels: rels and "alternate" in rels):
        if tag.get("href", "").rstrip("/") == f"{BASE_URL}/en":
            tag.decompose()
            changed = True

    h1 = soup.find("h1")
    fallback = normalize_space(h1.get_text(" ")) if h1 else ""
    title_text = clean_title(soup.title.get_text(" ") if soup.title else "", fallback, rel)
    if soup.title is None:
        title_tag = soup.new_tag("title")
        soup.head.insert(0, title_tag)
    else:
        title_tag = soup.title
    if title_tag.string != title_text:
        title_tag.string = title_text
        changed = True

    desc_tag = soup.find("meta", attrs={"name": re.compile(r"^description$", re.I)})
    desc = desc_tag.get("content", "") if desc_tag else ""
    if should_replace_description(desc):
        desc = summarize(soup, rel)
        upsert_meta(soup, "description", "description", desc)
        changed = True
    else:
        desc = normalize_space(desc)

    robots = soup.find("meta", attrs={"name": re.compile(r"^robots$", re.I)})
    if robots is None:
        upsert_meta(soup, "robots", "robots", "index,follow,max-image-preview:large")
        changed = True

    page_type = "website" if rel in {"index.html", "blog/index.html", "about.html", "projects.html", "contact.html", "resume.html"} or rel.endswith("/index.html") else "article"
    upsert_meta(soup, "og:type", "og:type", page_type, "property")
    upsert_meta(soup, "og:site_name", "og:site_name", "Yangming Li", "property")
    upsert_meta(soup, "og:title", "og:title", title_text, "property")
    upsert_meta(soup, "og:description", "og:description", desc, "property")
    upsert_meta(soup, "og:url", "og:url", canonical_for(path), "property")
    upsert_meta(soup, "og:image", "og:image", f"{BASE_URL}/img/Logo.png", "property")
    upsert_meta(soup, "twitter:card", "twitter:card", "summary_large_image")
    upsert_meta(soup, "twitter:title", "twitter:title", title_text)
    upsert_meta(soup, "twitter:description", "twitter:description", desc)
    upsert_meta(soup, "twitter:image", "twitter:image", f"{BASE_URL}/img/Logo.png")
    changed = True

    output = str(soup)
    if output != path.read_text(encoding="utf-8", errors="ignore"):
        path.write_text(output, encoding="utf-8")
        return True
    return changed


def main() -> None:
    changed = []
    for path in sorted(ROOT.rglob("*.html")):
        if is_excluded(path):
            continue
        if clean_file(path):
            changed.append(path.relative_to(ROOT).as_posix())
    print(f"Cleaned SEO metadata in {len(changed)} files.")
    for item in changed:
        print(item)


if __name__ == "__main__":
    main()
