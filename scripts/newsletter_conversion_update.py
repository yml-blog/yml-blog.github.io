#!/usr/bin/env python3
"""Newsletter and conversion pass for the static personal site."""

from __future__ import annotations

import json
import re
from datetime import date
from pathlib import Path

from bs4 import BeautifulSoup


ROOT = Path(__file__).resolve().parents[1]
BASE_URL = "https://yangmingli.com"
TODAY = date(2026, 6, 12).isoformat()
NEWSLETTER_NAME = "Yangming Li's Newsletter"
NEWSLETTER_FORM_ACTION_URL = "/api/newsletter-subscribe"
# The static forms post to the Vercel serverless newsletter API.
# Secrets stay server-side in Supabase and Resend environment variables.
PRIVACY_NOTE = "1–2 emails per month. No spam. Unsubscribe anytime."

EXCLUDE_DIRS = {".git", "__pycache__", "templates", "email-templates", "nha-cai", "focus-room/moodist-main"}
EXCLUDE_FILES = {"google6a208e5b3409387b.html", "readme.htm"}
EXCLUDE_PATHS = {"focus-room/v1/index.html", "product/index.html"}

SITE_LINKS = [
    ("About", "/about.html"),
    ("Projects", "/projects.html"),
    ("AI Engineering", "/ai-engineering/"),
    ("LLM Evaluation", "/llm-evaluation/"),
    ("Data Products", "/data-products/"),
    ("Case Studies", "/case-studies/"),
    ("AI Product Builder", "/ai-product-builder.html"),
    ("Blog", "/blog/"),
    ("Resume", "/resume.html"),
    ("Contact", "/contact.html"),
    ("Subscribe", "/subscribe/"),
    ("LinkedIn", "https://www.linkedin.com/in/yangming-li-tech/"),
    ("GitHub", "https://github.com/yml-blog"),
]

NAV_LINKS = [item for item in SITE_LINKS if item[0] not in {"LinkedIn", "GitHub"}]

LINK_REWRITES = {
    "/llm-evaluation.html": "/llm-evaluation/",
    "llm-evaluation.html": "/llm-evaluation/",
    "../llm-evaluation.html": "/llm-evaluation/",
    "/data-products.html": "/data-products/",
    "data-products.html": "/data-products/",
    "../data-products.html": "/data-products/",
}

MAJOR_META = {
    "index.html": {
        "title": "Yangming Li | Applied AI Systems, LLM Evaluation, Data Products",
        "description": "Yangming Li builds applied AI systems, LLM evaluation workflows, MLOps foundations, and data products for teams shipping production AI.",
        "canonical": f"{BASE_URL}/",
        "keywords": "Yangming Li, applied AI systems, LLM evaluation, data products, MLOps, AI product builder",
    },
    "about.html": {
        "title": "About Yangming Li | Applied AI Engineer and Product Builder",
        "description": "Learn about Yangming Li's applied AI, data science, LLM systems, MLOps, data product, and product engineering focus.",
        "canonical": f"{BASE_URL}/about.html",
        "keywords": "Yangming Li, applied AI engineer, data scientist, AI product builder",
    },
    "projects.html": {
        "title": "Projects | Applied AI Systems and Data Products by Yangming Li",
        "description": "Explore Yangming Li's applied AI, document intelligence, MLOps, experimentation, data product, and product engineering projects.",
        "canonical": f"{BASE_URL}/projects.html",
        "keywords": "AI projects, data products, applied AI portfolio, Yangming Li",
    },
    "resume.html": {
        "title": "Resume | Yangming Li Applied AI Engineer",
        "description": "Resume overview for Yangming Li across applied AI engineering, data science, LLM systems, MLOps, data products, and product work.",
        "canonical": f"{BASE_URL}/resume.html",
        "keywords": "Yangming Li resume, AI engineer, data scientist, product builder",
    },
    "contact.html": {
        "title": "Contact Yangming Li | Applied AI and Data Product Collaboration",
        "description": "Contact Yangming Li for applied AI systems, LLM evaluation, data products, product analytics, MLOps, and technical collaboration.",
        "canonical": f"{BASE_URL}/contact.html",
        "keywords": "contact Yangming Li, applied AI, data science, product analytics",
    },
    "blog/index.html": {
        "title": "Blog | Yangming Li on Applied AI, Evaluation, Data Products",
        "description": "Browse practical writing by Yangming Li on LLM systems, AI evaluation, RAG, data products, MLOps, statistical ML, and product strategy.",
        "canonical": f"{BASE_URL}/blog/",
        "keywords": "Yangming Li blog, applied AI, LLM evaluation, data products, MLOps",
    },
    "ai-engineering/index.html": {
        "title": "AI Engineering | Yangming Li Applied AI Systems",
        "description": "A topic hub on LLM systems, RAG, agents, evaluation, MLOps, observability, and production AI architecture by Yangming Li.",
        "canonical": f"{BASE_URL}/ai-engineering/",
        "keywords": "AI engineering, applied AI systems, LLM systems, RAG, MLOps",
    },
    "llm-evaluation/index.html": {
        "title": "LLM Evaluation | RAG, Agent Testing, and AI System Quality",
        "description": "A practical hub for LLM evaluation frameworks, RAG evaluation, schema validation, agent testing, uncertainty, release gates, and monitoring.",
        "canonical": f"{BASE_URL}/llm-evaluation/",
        "keywords": "LLM evaluation, RAG evaluation, AI agent testing, schema validation, AI monitoring",
    },
    "data-products/index.html": {
        "title": "Data Products | AI Data Products, Analytics Systems, Experimentation",
        "description": "A topic hub on data products, AI data products, analytics systems, data engineering, experiments, decision support, and monitoring.",
        "canonical": f"{BASE_URL}/data-products/",
        "keywords": "data products, AI data products, analytics systems, experimentation, data engineering",
    },
    "case-studies/index.html": {
        "title": "Case Studies | Applied AI, Data Products, and Product Systems",
        "description": "Selected case-study paths from Yangming Li's work across applied AI systems, evaluation, data products, focus tools, and product workflows.",
        "canonical": f"{BASE_URL}/case-studies/",
        "keywords": "AI case studies, data product case studies, applied AI portfolio, product systems",
    },
    "subscribe/index.html": {
        "title": "Subscribe to Yangming Li's Newsletter | Yangming Li",
        "description": "Subscribe to Yangming Li's Newsletter for practical notes on LLM systems, evaluation, data products, MLOps, and production AI workflows.",
        "canonical": f"{BASE_URL}/subscribe/",
        "keywords": "Yangming Li's Newsletter, LLM systems newsletter, AI evaluation newsletter, MLOps newsletter",
    },
}

HUBS = {
    "ai-engineering/index.html": {
        "eyebrow": "Applied AI Systems",
        "h1": "AI Engineering",
        "lead": "A practical map for building LLM systems, agent workflows, RAG applications, evaluation layers, and MLOps foundations that can survive contact with production.",
        "sections": [
            (
                "Start here",
                "AI engineering is the work around the model: retrieval, orchestration, data contracts, schemas, evaluation, monitoring, and product boundaries. The writing here is for teams that need AI features to be reviewed, shipped, and improved rather than only demoed.",
            ),
            (
                "Production questions",
                "Useful AI systems need answers to concrete questions. What sources are allowed? What output shape is valid? Which failures require escalation? Which examples become regression tests? Which metrics show quality after launch?",
            ),
            (
                "Internal links",
                "The related articles below connect architecture to implementation: agent evaluation, tool integration, uncertainty, document AI, MLOps, and reproducible machine learning environments.",
            ),
        ],
        "cards": [
            ("Testing and evaluating Copilot agents", "/testing-evaluating-copilot-agents.html", "Schema-first evaluation, test sets, release gates, and human review for Copilot-style agents."),
            ("Model Context Protocol guide", "/mcp-protocol-guide.html", "Tool and context integration patterns for connected AI systems."),
            ("Agentic AI systems with n8n", "/n8n-ai-workflows.html", "Workflow boundaries, tool use, and operational constraints for agentic automation."),
            ("LlamaReport and document AI systems", "/llama-report-guide.html", "Document transformation architecture, review workflows, and enterprise AI design."),
            ("MLOps essential skills", "/mlops-essential-skills.html", "Model packaging, deployment, monitoring, and production ML operations."),
            ("Docker for machine learning", "/docker-in-ml.html", "Reproducible ML environments and deployment foundations."),
        ],
    },
    "llm-evaluation/index.html": {
        "eyebrow": "Evaluation Systems",
        "h1": "LLM Evaluation",
        "lead": "A topic hub for evaluating LLM systems, RAG workflows, AI agents, structured extraction, uncertainty, schema validity, and production monitoring.",
        "sections": [
            (
                "Start with risk",
                "LLM evaluation should start from product risk, not an abstract score. A retrieval answer, a document extractor, and a tool-calling agent fail in different ways, so the evaluation layer needs task-specific fixtures and gates.",
            ),
            (
                "Evaluation layers",
                "Use deterministic checks first: schema validity, exact fields, source coverage, refusals, and business rules. Add model-based graders for semantic comparison only after the contract is clear enough to inspect.",
            ),
            (
                "After launch",
                "Monitor correction rate, escalation rate, citation quality, stale-source usage, latency, cost, and regressions by prompt, model, schema, and knowledge-source version.",
            ),
        ],
        "cards": [
            ("Testing and evaluating Copilot agents", "/testing-evaluating-copilot-agents.html", "A concrete agent testing workflow with schema contracts, custom graders, and release gates."),
            ("Uncertainty quantification for LLMs", "/uqlm-teaching-guide.html", "Confidence and uncertainty signals for safer review workflows."),
            ("AI agent evaluation checklist", "/ai-agent-evaluation-checklist.html", "A practical checklist for launch readiness and regression thinking."),
            ("Model Context Protocol guide", "/mcp-protocol-guide.html", "Integration boundaries that affect tool-calling evaluation."),
            ("Trustworthy machine learning", "/trust-worth-machine-learning-1.html", "Responsible AI foundations for monitoring, reliability, and accountability."),
            ("Decoder-only architectures", "/decoder-only-architectures.html", "Model architecture background for understanding modern LLM behavior."),
        ],
    },
    "data-products/index.html": {
        "eyebrow": "Data Products",
        "h1": "Data Products",
        "lead": "A topic hub for analytics systems, AI data products, data engineering, experimentation, decision support, monitoring, and product workflows.",
        "sections": [
            (
                "Beyond dashboards",
                "A data product is a repeated workflow that turns data into a decision, action, or operating habit. It needs a named user, a decision cadence, trusted definitions, and a feedback loop.",
            ),
            (
                "AI data products",
                "AI data products need traceable model outputs, visible uncertainty, review paths, and enough metadata to understand which data, prompt, schema, and reviewer decision produced an output.",
            ),
            (
                "What to monitor",
                "Track freshness, schema changes, missing values, usage, adoption, overrides, drift, correction rate, experiment impact, and recurring interpretation questions.",
            ),
        ],
        "cards": [
            ("Databricks lakehouse guide", "/databricks-comprehensive-guide.html", "Data engineering, MLflow, Delta Lake, and platform patterns."),
            ("Statistical tests for survey analysis", "/key-statistical-tests-survey-analysis.html", "Decision-support statistics and interpretation trade-offs."),
            ("A/B test engineering guide", "/engineering/ab-test-engineering-guide.html", "Experiment infrastructure for product measurement."),
            ("Polars guide", "/polars-guide.html", "Fast DataFrame workflows for practical data engineering."),
            ("Building high-impact value propositions", "/building-high-impact-value-propositions.html", "Product framing for turning data capabilities into user value."),
            ("Healthcare AI analytics", "/healthcare-ai-analytics.html", "Applied analytics and AI thinking in healthcare workflows."),
        ],
    },
    "case-studies/index.html": {
        "eyebrow": "Selected Work",
        "h1": "Case Studies",
        "lead": "A curated path through applied AI, evaluation, data product, product systems, and focus-tool work for hiring managers, collaborators, and applied AI/product audiences.",
        "sections": [
            (
                "How to read these",
                "Each case-study path highlights a different kind of judgment: production AI reliability, data product design, workflow measurement, product value, or focused user experience.",
            ),
            (
                "What they show",
                "The common thread is practical systems thinking: define the user, constrain the workflow, make outputs inspectable, design for review, and connect technical work to adoption.",
            ),
            (
                "For collaborators",
                "Start with AI evaluation if you care about shipping reliable agents, data products if you care about decision systems, and Focus Room if you want to see product interaction craft.",
            ),
        ],
        "cards": [
            ("Testing and evaluating Copilot agents", "/testing-evaluating-copilot-agents.html", "A production-readiness case for agent testing, release gates, and review loops."),
            ("AI Agent Evaluation Launch Checklist", "/ai-agent-evaluation-checklist.html", "A lead-magnet style product artifact for operational AI quality."),
            ("Healthcare AI analytics", "/healthcare-ai-analytics.html", "Applied AI and analytics framing for healthcare operations."),
            ("A/B test engineering guide", "/engineering/ab-test-engineering-guide.html", "Experiment infrastructure and measurement systems for product teams."),
            ("Focus Room", "/focus-room/", "A product prototype with interaction design, ambient focus, and a calmer work-start ritual."),
            ("Projects overview", "/projects.html", "A broader index of public project and portfolio themes."),
        ],
    },
}


def rel_path(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def public_html_files() -> list[Path]:
    files = []
    for path in ROOT.rglob("*.html"):
        rel = rel_path(path)
        parts = set(Path(rel).parts)
        if rel in EXCLUDE_PATHS:
            continue
        if path.name in EXCLUDE_FILES:
            continue
        if any(part.startswith(".tmp-") for part in Path(rel).parts):
            continue
        if any(part in EXCLUDE_DIRS for part in parts):
            continue
        if rel.startswith("focus-room/moodist-main/"):
            continue
        files.append(path)
    return sorted(files)


def ensure_head(soup: BeautifulSoup):
    head = soup.find("head")
    if head:
        return head
    html = soup.find("html") or soup.new_tag("html")
    if not soup.find("html"):
        soup.append(html)
    head = soup.new_tag("head")
    html.insert(0, head)
    return head


def ensure_link(soup: BeautifulSoup, href: str, rel: str = "stylesheet") -> None:
    head = ensure_head(soup)
    if head.find("link", href=href):
        return
    tag = soup.new_tag("link", rel=rel, href=href)
    head.append(tag)


def ensure_script(soup: BeautifulSoup, src: str) -> None:
    head = ensure_head(soup)
    existing = soup.find("script", src=src)
    if existing:
        existing["defer"] = ""
        return
    tag = soup.new_tag("script", src=src)
    tag["defer"] = ""
    head.append(tag)


def set_title(soup: BeautifulSoup, title: str) -> None:
    head = ensure_head(soup)
    tag = head.find("title")
    if not tag:
        tag = soup.new_tag("title")
        head.append(tag)
    tag.string = title


def upsert_meta(soup: BeautifulSoup, key: str, value: str, attr: str = "name") -> None:
    head = ensure_head(soup)
    tag = head.find("meta", attrs={attr: key})
    if not tag:
        tag = soup.new_tag("meta")
        tag[attr] = key
        head.append(tag)
    tag["content"] = value


def upsert_canonical(soup: BeautifulSoup, href: str) -> None:
    head = ensure_head(soup)
    tag = head.find("link", rel=lambda value: value and "canonical" in value)
    if not tag:
        tag = soup.new_tag("link", rel="canonical")
        head.append(tag)
    tag["href"] = href


def apply_meta(soup: BeautifulSoup, meta: dict[str, str], og_type: str = "website") -> None:
    title = meta["title"]
    description = meta["description"]
    canonical = meta["canonical"]
    set_title(soup, title)
    upsert_meta(soup, "description", description)
    upsert_meta(soup, "robots", "index,follow,max-image-preview:large")
    upsert_meta(soup, "keywords", meta.get("keywords", "Yangming Li, applied AI, data products, LLM systems"))
    upsert_canonical(soup, canonical)
    upsert_meta(soup, "og:type", og_type, "property")
    upsert_meta(soup, "og:site_name", "Yangming Li", "property")
    upsert_meta(soup, "og:title", title, "property")
    upsert_meta(soup, "og:description", description, "property")
    upsert_meta(soup, "og:url", canonical, "property")
    upsert_meta(soup, "og:image", f"{BASE_URL}/img/Logo.png", "property")
    upsert_meta(soup, "og:image:alt", "Yangming Li site logo", "property")
    upsert_meta(soup, "twitter:card", "summary_large_image")
    upsert_meta(soup, "twitter:title", title)
    upsert_meta(soup, "twitter:description", description)
    upsert_meta(soup, "twitter:image", f"{BASE_URL}/img/Logo.png")


def add_json_ld(soup: BeautifulSoup, data: dict) -> None:
    head = ensure_head(soup)
    tag = soup.new_tag("script", type="application/ld+json")
    tag.string = json.dumps(data, ensure_ascii=False, indent=2)
    head.append(tag)


def json_ld_type(payload):
    if isinstance(payload, dict):
        return payload.get("@type")
    return None


def remove_json_ld_types(soup: BeautifulSoup, types: set[str]) -> None:
    for script in list(soup.find_all("script", type="application/ld+json")):
        try:
            payload = json.loads(script.string or script.get_text() or "{}")
        except Exception:
            continue

        payloads = payload.get("@graph", []) if isinstance(payload, dict) and "@graph" in payload else [payload]
        found = False
        for item in payloads:
            item_type = json_ld_type(item)
            if isinstance(item_type, list):
                found = any(entry in types for entry in item_type)
            elif item_type in types:
                found = True
            if found:
                break
        if found:
            script.decompose()


def person_schema() -> dict:
    return {
        "@type": "Person",
        "@id": f"{BASE_URL}/#yangming-li",
        "name": "Yangming Li",
        "url": f"{BASE_URL}/",
        "image": f"{BASE_URL}/img/Logo.png",
        "jobTitle": "Applied AI Engineer, Data Scientist, and AI Product Builder",
        "description": "Yangming Li writes about applied AI systems, LLM systems, evaluation, statistical machine learning, data engineering, data products, MLOps, and AI product thinking.",
        "sameAs": [
            "https://www.linkedin.com/in/yangming-li-tech/",
            "https://github.com/yml-blog",
        ],
        "knowsAbout": [
            "Applied AI systems",
            "LLM evaluation",
            "RAG evaluation",
            "AI agent testing",
            "MLOps",
            "Data products",
            "AI product strategy",
            "Production AI workflows",
        ],
    }


def website_schema() -> dict:
    return {
        "@type": "WebSite",
        "@id": f"{BASE_URL}/#website",
        "name": "Yangming Li",
        "url": f"{BASE_URL}/",
        "inLanguage": "en",
        "publisher": {"@id": f"{BASE_URL}/#yangming-li"},
        "potentialAction": [
            {
                "@type": "SearchAction",
                "target": f"{BASE_URL}/?q={{search_term_string}}",
                "query-input": "required name=search_term_string",
            },
            {
                "@type": "SubscribeAction",
                "name": f"Subscribe to {NEWSLETTER_NAME}",
                "target": f"{BASE_URL}/subscribe/",
            },
        ],
    }


def breadcrumb(items: list[tuple[str, str]]) -> dict:
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": index + 1,
                "name": label,
                "item": f"{BASE_URL}{href}" if href.startswith("/") else href,
            }
            for index, (label, href) in enumerate(items)
        ],
    }


def webpage_schema(name: str, url: str, description: str) -> dict:
    return {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": name,
        "url": url,
        "description": description,
        "inLanguage": "en",
        "isPartOf": {"@id": f"{BASE_URL}/#website"},
        "about": {"@id": f"{BASE_URL}/#yangming-li"},
    }


def newsletter_component(source: str, title_tag: str = "h2", compact: bool = False) -> str:
    title = f'<{title_tag} id="{source}-newsletter-title">Subscribe to Yangming Li's Newsletter</{title_tag}>'
    class_name = "newsletter-card newsletter-compact" if compact else "newsletter-card"
    topics = "" if compact else """
      <ul class="newsletter-topic-list" aria-label="Newsletter topics">
        <li>LLM systems</li>
        <li>Evaluation</li>
        <li>Data products</li>
        <li>MLOps</li>
        <li>Production AI</li>
      </ul>
    """
    return f"""
    <section class="{class_name}" aria-labelledby="{source}-newsletter-title">
      <div class="newsletter-card-inner">
        <div class="newsletter-copy">
          <span class="newsletter-kicker">Newsletter</span>
          {title}
          <p>Monthly notes on AI systems, applied machine learning, evaluation, and product workflows.</p>
          {topics}
        </div>
        <form class="newsletter-form" action="{NEWSLETTER_FORM_ACTION_URL}" method="post" data-newsletter-form data-source="{source}">
          <label class="sr-only" for="{source}-email">Email address</label>
          <input id="{source}-email" name="email" type="email" autocomplete="email" placeholder="your@email.com" required>
          <input type="text" name="website" class="sr-only" tabindex="-1" autocomplete="off" aria-hidden="true">
          <input type="hidden" name="source" value="{source}">
          <button type="submit"><i class="fa fa-envelope-o" aria-hidden="true"></i> Subscribe</button>
          <p class="newsletter-privacy">{PRIVACY_NOTE}</p>
          <p class="newsletter-status newsletter-success" data-newsletter-success role="status" aria-live="polite"></p>
          <p class="newsletter-status newsletter-error" data-newsletter-error role="alert" aria-live="assertive"></p>
        </form>
      </div>
    </section>
    """


def hero_subscribe_form() -> str:
    return f"""
    <form class="hero-subscribe-form" action="{NEWSLETTER_FORM_ACTION_URL}" method="post" data-newsletter-form data-source="homepage-hero">
      <div class="hero-subscribe-copy">
        <h2>Subscribe to Yangming Li's Newsletter</h2>
        <p>Monthly notes on AI systems, applied machine learning, evaluation, and product workflows.</p>
      </div>
      <label class="sr-only" for="homepage-hero-email">Email address</label>
      <input id="homepage-hero-email" name="email" type="email" autocomplete="email" placeholder="your@email.com" required>
      <input type="text" name="website" class="sr-only" tabindex="-1" autocomplete="off" aria-hidden="true">
      <input type="hidden" name="source" value="homepage-hero">
      <button type="submit"><i class="fa fa-envelope-o" aria-hidden="true"></i> Subscribe</button>
      <p class="hero-subscribe-privacy">1–2 emails per month. No spam. Unsubscribe anytime.</p>
      <p class="newsletter-status newsletter-success hero-subscribe-status" data-newsletter-success role="status" aria-live="polite"></p>
      <p class="newsletter-status newsletter-error hero-subscribe-status" data-newsletter-error role="alert" aria-live="assertive"></p>
    </form>
    """


def render_link(label: str, href: str, class_name: str | None = None) -> str:
    class_attr = f' class="{class_name}"' if class_name else ""
    rel_attr = ' rel="noopener noreferrer"' if href.startswith("http") else ""
    return f'<a{class_attr} href="{href}"{rel_attr}>{label}</a>'


def footer_html() -> str:
    links = "".join(
        f'<li>{render_link(label, href, "newsletter-button footer-subscribe-link" if label == "Subscribe" else None)}</li>'
        for label, href in SITE_LINKS
    )
    return f"""
    <footer aria-label="Site footer" class="site-footer">
      <div class="site-footer-inner">
        {newsletter_component("site-footer", "h2", compact=False)}
        <p class="site-footer-title">Yangming Li</p>
        <ul class="site-footer-links">{links}</ul>
      </div>
    </footer>
    """


def replace_site_footer(soup: BeautifulSoup) -> None:
    footer_soup = BeautifulSoup(footer_html(), "html.parser")
    new_footer = footer_soup.find("footer")
    existing = soup.find("footer", class_="site-footer")
    if existing:
        existing.replace_with(new_footer)
        return

    body = soup.find("body")
    if body:
        body.append(new_footer)


def rewrite_links(soup: BeautifulSoup) -> None:
    for tag in soup.find_all(["a", "link"]):
        attr = "href"
        href = tag.get(attr)
        if href in LINK_REWRITES:
            tag[attr] = LINK_REWRITES[href]


def update_navs(soup: BeautifulSoup) -> None:
    for nav in soup.select(".pillar-nav, .seo-nav, .portfolio-nav"):
        nav.clear()
        for label, href in NAV_LINKS:
            link = soup.new_tag("a", href=href)
            if label == "Subscribe":
                link["class"] = "nav-subscribe-button"
            link.string = label
            nav.append(link)

    tabs = soup.find("ul", id="myTab")
    if tabs and not tabs.find("a", href="/subscribe/"):
        li = soup.new_tag("li", **{"class": "nav-item", "role": "presentation"})
        link = soup.new_tag("a", href="/subscribe/", **{"class": "nav-link nav-subscribe-button"})
        link.string = "Subscribe"
        li.append(link)
        tabs.append(li)


def update_explore_links(soup: BeautifulSoup) -> None:
    for links in soup.select(".explore-work-links"):
        links.clear()
        for label, href in NAV_LINKS:
            li = soup.new_tag("li")
            link = soup.new_tag("a", href=href)
            if label == "Subscribe":
                link["class"] = "newsletter-button"
            link.string = label
            li.append(link)
            links.append(li)


def update_homepage(soup: BeautifulSoup) -> None:
    meta = MAJOR_META["index.html"]
    apply_meta(soup, meta)
    ensure_link(soup, "/css/newsletter.css")
    ensure_script(soup, "/js/newsletter.js")

    h1 = soup.find("h1")
    if h1:
        h1.clear()
        welcome = soup.new_tag("span", **{"class": "hero-welcome"})
        welcome.string = "Welcome, I'm Yangming Li"
        h1.append(welcome)
        h1.append("I build applied AI systems that teams can evaluate, trust, and ship.")

    typed = soup.find(class_="typing-line")
    if typed:
        text = "Applied AI engineer and product builder focused on LLM systems, evaluation, RAG, MLOps, data products, and production AI workflows for healthcare, finance, and enterprise teams."
        typed["data-typed-text"] = text
        typed.string = text

    intro = soup.find(class_="typing-block")
    if intro:
        text = "I help translate AI prototypes into reliable product systems: clear data contracts, reviewable outputs, evaluation loops, and decision tools that fit the workflow."
        intro["data-typed-text"] = text
        intro.string = text

    for element in soup.select(".hero-audience-strip, .hero-proof-line"):
        element.decompose()


    for cta in soup.select(".hero-cta, .hero-cta-original"):
        for subscribe in cta.find_all("a", href="/subscribe/"):
            subscribe.decompose()
        if not cta.find("a", href="/projects.html"):
            work = soup.new_tag("a", href="/projects.html", **{"class": "btn btn-default"})
            icon = soup.new_tag("i", **{"class": "fa fa-briefcase"})
            work.append(icon)
            work.append(" View Work")
            cta.insert(0, work)

    if not soup.find(class_="hero-subscribe-form"):
        theme_switch = soup.find(class_="theme-switch-wrapper")
        if theme_switch:
            form = BeautifulSoup(hero_subscribe_form(), "html.parser").find("form")
            theme_switch.insert_before(form)

    for component in soup.select(".newsletter-home-section"):
        component.decompose()

    remove_json_ld_types(soup, {"WebSite", "Person"})
    add_json_ld(soup, {"@context": "https://schema.org", "@graph": [website_schema(), person_schema()]})


def is_article(soup: BeautifulSoup) -> bool:
    og_type = soup.find("meta", attrs={"property": "og:type"})
    if og_type and (og_type.get("content") or "").lower() == "article":
        return True
    for script in soup.find_all("script", type="application/ld+json"):
        try:
            payload = json.loads(script.string or script.get_text() or "{}")
        except Exception:
            continue
        payloads = payload.get("@graph", []) if isinstance(payload, dict) and "@graph" in payload else [payload]
        if any(json_ld_type(item) in {"Article", "BlogPosting"} for item in payloads if isinstance(item, dict)):
            return True
    return False


def article_has_schema(soup: BeautifulSoup) -> bool:
    for script in soup.find_all("script", type="application/ld+json"):
        try:
            payload = json.loads(script.string or script.get_text() or "{}")
        except Exception:
            continue
        payloads = payload.get("@graph", []) if isinstance(payload, dict) and "@graph" in payload else [payload]
        if any(json_ld_type(item) in {"Article", "BlogPosting"} for item in payloads if isinstance(item, dict)):
            return True
    return False


def canonical_for_path(path: Path) -> str:
    rel = rel_path(path)
    if rel == "index.html":
        return f"{BASE_URL}/"
    if rel.endswith("/index.html"):
        return f"{BASE_URL}/{rel[:-len('index.html')]}"
    return f"{BASE_URL}/{rel}"


def ensure_article_schema(soup: BeautifulSoup, path: Path) -> None:
    if article_has_schema(soup):
        return
    title_tag = soup.find("title")
    title = title_tag.get_text(" ", strip=True).replace(" | Yangming Li", "") if title_tag else "Article"
    desc_tag = soup.find("meta", attrs={"name": "description"})
    description = desc_tag.get("content", "") if desc_tag else f"Article by Yangming Li on applied AI, data science, product, and engineering."
    canonical = canonical_for_path(path)
    add_json_ld(
        soup,
        {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": title,
            "description": description,
            "image": f"{BASE_URL}/img/Logo.png",
            "author": {"@type": "Person", "name": "Yangming Li", "url": f"{BASE_URL}/about.html"},
            "publisher": {
                "@type": "Organization",
                "name": "Yangming Li",
                "logo": {"@type": "ImageObject", "url": f"{BASE_URL}/img/Logo.png"},
            },
            "datePublished": TODAY,
            "dateModified": TODAY,
            "mainEntityOfPage": {"@type": "WebPage", "@id": canonical},
            "inLanguage": "en",
            "isAccessibleForFree": True,
        },
    )


def add_article_newsletter(soup: BeautifulSoup, source: str) -> None:
    if soup.find(attrs={"data-newsletter-article-footer": "true"}):
        return
    component = BeautifulSoup(newsletter_component(source, "h2"), "html.parser").find("section")
    component["data-newsletter-article-footer"] = "true"
    component["class"] = component.get("class", []) + ["article-newsletter-footer"]
    host = soup.select_one("main.article-prose-surface") or soup.find("main")
    if host:
        host.append(component)
        return

    footer = soup.find("footer", class_="site-footer")
    body = soup.find("body")
    if footer:
        footer.insert_before(component)
    elif body:
        body.append(component)


def update_existing_page(path: Path) -> None:
    rel = rel_path(path)
    soup = BeautifulSoup(path.read_text(encoding="utf-8", errors="ignore"), "html.parser")

    html = soup.find("html")
    if html:
        html["lang"] = "en"

    rewrite_links(soup)
    update_navs(soup)
    update_explore_links(soup)
    ensure_link(soup, "/css/newsletter.css")
    ensure_script(soup, "/js/newsletter.js")

    if rel == "index.html":
        update_homepage(soup)
    elif rel in MAJOR_META:
        apply_meta(soup, MAJOR_META[rel])

    if rel in {"llm-evaluation.html", "data-products.html"}:
        clean = f"{BASE_URL}/{'llm-evaluation/' if rel.startswith('llm') else 'data-products/'}"
        upsert_canonical(soup, clean)
        upsert_meta(soup, "robots", "noindex,follow,max-image-preview:large")

    if is_article(soup):
        ensure_article_schema(soup, path)
        add_article_newsletter(soup, f"article-{Path(rel).stem}")

    if rel not in {"focus-room/moodist-main/public/robots.txt"}:
        replace_site_footer(soup)

    path.write_text(str(soup), encoding="utf-8")


def hub_page_html(rel: str, data: dict) -> str:
    meta = MAJOR_META[rel]
    cards = "\n".join(
        f"""
        <article class="pillar-card">
          <h3><a href="{href}">{title}</a></h3>
          <p>{desc}</p>
        </article>
        """
        for title, href, desc in data["cards"]
    )
    sections = "\n".join(
        f"""
        <section class="portfolio-section">
          <div class="portfolio-section-header">
            <span class="seo-eyebrow">{heading}</span>
            <h2>{heading}</h2>
          </div>
          <p>{body}</p>
        </section>
        """
        for heading, body in data["sections"]
    )
    nav = "".join(
        render_link(label, href, "nav-subscribe-button" if label == "Subscribe" else None)
        for label, href in NAV_LINKS
    )
    page_schema = webpage_schema(data["h1"], meta["canonical"], meta["description"])
    crumbs = breadcrumb([("Home", "/"), (data["h1"], "/" + rel[:-len("index.html")])])
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>{meta['title']}</title>
<meta name="description" content="{meta['description']}"/>
<meta name="robots" content="index,follow,max-image-preview:large"/>
<meta name="keywords" content="{meta['keywords']}"/>
<link rel="canonical" href="{meta['canonical']}"/>
<meta property="og:type" content="website"/>
<meta property="og:site_name" content="Yangming Li"/>
<meta property="og:title" content="{meta['title']}"/>
<meta property="og:description" content="{meta['description']}"/>
<meta property="og:url" content="{meta['canonical']}"/>
<meta property="og:image" content="{BASE_URL}/img/Logo.png"/>
<meta property="og:image:alt" content="Yangming Li site logo"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="{meta['title']}"/>
<meta name="twitter:description" content="{meta['description']}"/>
<meta name="twitter:image" content="{BASE_URL}/img/Logo.png"/>
<link rel="icon" href="/favicon.png"/>
<link rel="stylesheet" href="/css/bootstrap.min.css"/>
<link rel="stylesheet" href="/css/font-awesome.min.css"/>
<link rel="stylesheet" href="/css/typography.css"/>
<link rel="stylesheet" href="/css/portfolio-pages.css"/>
<link rel="stylesheet" href="/css/newsletter.css"/>
<link rel="alternate" type="application/rss+xml" title="Yangming Li RSS Feed" href="/rss.xml"/>
<script defer src="/js/i18n.js"></script>
<script defer src="/js/newsletter.js"></script>
<script type="application/ld+json">{json.dumps(page_schema, ensure_ascii=False, indent=2)}</script>
<script type="application/ld+json">{json.dumps(crumbs, ensure_ascii=False, indent=2)}</script>
</head>
<body class="portfolio-page">
<main class="pillar-page">
  <nav aria-label="Primary" class="pillar-nav">{nav}</nav>
  <section class="pillar-hero">
    <span class="eyebrow">{data['eyebrow']}</span>
    <h1>{data['h1']}</h1>
    <p class="lead">{data['lead']}</p>
  </section>
  {sections}
  <section class="portfolio-section" aria-labelledby="related-writing-title">
    <div class="portfolio-section-header">
      <span class="seo-eyebrow">Related writing</span>
      <h2 id="related-writing-title">Relevant articles and artifacts</h2>
    </div>
    <div class="pillar-grid">{cards}</div>
  </section>
</main>
{footer_html()}
</body>
</html>
"""


def subscribe_page_html() -> str:
    rel = "subscribe/index.html"
    meta = MAJOR_META[rel]
    nav = "".join(
        render_link(label, href, "nav-subscribe-button" if label == "Subscribe" else None)
        for label, href in NAV_LINKS
    )
    page_schema = webpage_schema("Subscribe to Yangming Li's Newsletter", meta["canonical"], meta["description"])
    crumbs = breadcrumb([("Home", "/"), ("Subscribe", "/subscribe/")])
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>{meta['title']}</title>
<meta name="description" content="{meta['description']}"/>
<meta name="robots" content="index,follow,max-image-preview:large"/>
<meta name="keywords" content="{meta['keywords']}"/>
<link rel="canonical" href="{meta['canonical']}"/>
<meta property="og:type" content="website"/>
<meta property="og:site_name" content="Yangming Li"/>
<meta property="og:title" content="{meta['title']}"/>
<meta property="og:description" content="{meta['description']}"/>
<meta property="og:url" content="{meta['canonical']}"/>
<meta property="og:image" content="{BASE_URL}/img/Logo.png"/>
<meta property="og:image:alt" content="Yangming Li site logo"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="{meta['title']}"/>
<meta name="twitter:description" content="{meta['description']}"/>
<meta name="twitter:image" content="{BASE_URL}/img/Logo.png"/>
<link rel="icon" href="/favicon.png"/>
<link rel="stylesheet" href="/css/bootstrap.min.css"/>
<link rel="stylesheet" href="/css/font-awesome.min.css"/>
<link rel="stylesheet" href="/css/typography.css"/>
<link rel="stylesheet" href="/css/portfolio-pages.css"/>
<link rel="stylesheet" href="/css/newsletter.css"/>
<link rel="alternate" type="application/rss+xml" title="Yangming Li RSS Feed" href="/rss.xml"/>
<script defer src="/js/i18n.js"></script>
<script defer src="/js/newsletter.js"></script>
<script type="application/ld+json">{json.dumps(page_schema, ensure_ascii=False, indent=2)}</script>
<script type="application/ld+json">{json.dumps(crumbs, ensure_ascii=False, indent=2)}</script>
</head>
<body class="portfolio-page">
<main class="newsletter-page-shell">
  <nav aria-label="Primary" class="pillar-nav">{nav}</nav>
  <section class="newsletter-page-hero">
    <div class="newsletter-page-copy">
      <span class="newsletter-kicker">Newsletter</span>
      <h1>Yangming Li's Newsletter</h1>
      <p class="newsletter-page-lead">Practical notes about LLM systems, evaluation, data products, MLOps, and production AI workflows. Written for builders, hiring managers, collaborators, and product-minded teams who care about reliable AI in real workflows.</p>
      <div class="newsletter-note-grid">
        <article class="newsletter-note-card">
          <h2>LLM systems</h2>
          <p>Architecture notes on RAG, agents, tool boundaries, structured outputs, and review loops.</p>
        </article>
        <article class="newsletter-note-card">
          <h2>Evaluation</h2>
          <p>Practical thinking on test sets, graders, schema validation, uncertainty, and release gates.</p>
        </article>
        <article class="newsletter-note-card">
          <h2>Data products</h2>
          <p>How analytics, product workflows, MLOps, and decision systems fit together.</p>
        </article>
      </div>
    </div>
    <div class="newsletter-page-panel">
      {newsletter_component('subscribe-page', 'h2')}
    </div>
  </section>
  <section class="portfolio-section">
    <div class="portfolio-section-header">
      <span class="seo-eyebrow">What you get</span>
      <h2>Short, practical systems notes</h2>
    </div>
    <p>Expect notes that connect implementation details to product judgment: what to test, what to monitor, where human review belongs, and how to move from a promising prototype to a system people can trust.</p>
  </section>
</main>
{footer_html()}
</body>
</html>
"""


def write_generated_pages() -> None:
    for rel, data in HUBS.items():
        path = ROOT / rel
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(hub_page_html(rel, data), encoding="utf-8")

    subscribe = ROOT / "subscribe" / "index.html"
    subscribe.parent.mkdir(parents=True, exist_ok=True)
    subscribe.write_text(subscribe_page_html(), encoding="utf-8")


def update_redirects() -> None:
    redirects = ROOT / "_redirects"
    lines = redirects.read_text(encoding="utf-8", errors="ignore").splitlines() if redirects.exists() else []
    additions = [
        "/llm-evaluation.html  /llm-evaluation/  301!",
        "/data-products.html  /data-products/  301!",
        "/subscribe.html  /subscribe/  301!",
        "/case-studies.html  /case-studies/  301!",
    ]
    for entry in additions:
        if entry not in lines:
            lines.append(entry)
    redirects.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")

    vercel_path = ROOT / "vercel.json"
    data = json.loads(vercel_path.read_text(encoding="utf-8"))
    current = data.setdefault("redirects", [])
    additions_json = [
        {"source": "/llm-evaluation.html", "destination": "/llm-evaluation/", "permanent": True},
        {"source": "/data-products.html", "destination": "/data-products/", "permanent": True},
        {"source": "/subscribe.html", "destination": "/subscribe/", "permanent": True},
        {"source": "/case-studies.html", "destination": "/case-studies/", "permanent": True},
    ]
    for redirect in additions_json:
        if not any(item.get("source") == redirect["source"] for item in current):
            current.append(redirect)
    vercel_path.write_text(json.dumps(data, indent=4) + "\n", encoding="utf-8")


def update_robots() -> None:
    robots = """User-agent: *
Allow: /
Disallow: /admin/
Disallow: /private/
Disallow: /templates/
Disallow: /email-templates/
Disallow: /api/
Disallow: /nha-cai/

Sitemap: https://yangmingli.com/sitemap.xml
"""
    (ROOT / "robots.txt").write_text(robots, encoding="utf-8")


def main() -> None:
    write_generated_pages()
    for path in public_html_files():
        update_existing_page(path)
    update_redirects()
    update_robots()
    print("Newsletter conversion update complete.")


if __name__ == "__main__":
    main()
