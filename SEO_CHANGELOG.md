# SEO Changelog

Date: 2026-06-18

## Added

- Added four long-tail, application-style SEO guides designed to behave more like the RAG evaluation page than broad topic hubs:
  - `/copilot-agent-golden-test-set.html`
  - `/ab-testing-sample-size-python.html`
  - `/causal-inference-product-analytics.html`
  - `/model-calibration-reliability-diagrams-python.html`
- Added visible FAQ sections and matching FAQPage JSON-LD to the four new guides.
- Added practical examples for Copilot test-case schema design, A/B sample size planning, causal effect estimation, and model calibration checks.

## Changed

- Strengthened internal links from `/`, `/blog/`, `/ai-engineering/`, `/llm-evaluation/`, `/data-products/`, and related article pages to the new guides.
- Clarified keyword ownership:
  - Copilot agent golden test sets target Copilot/agent regression testing queries.
  - A/B sample size in Python targets experiment planning and power-analysis queries.
  - Causal inference for product analytics targets product analytics causal-decision queries.
  - Model calibration in Python targets reliability diagram and expected calibration error queries.
- Regenerated `sitemap.xml`; it now contains 65 canonical, indexable URLs.

## Validation

```text
python generate_sitemap.py
Generated 65 sitemap URLs.

python scripts\seo_audit.py
SEO audit passed for 65 indexable canonical pages.
Warnings remained for older priority articles that still use a generic social image.

HTML and JSON-LD validation
Verified one title, one meta description, one canonical, one H1, indexable robots, and valid JSON-LD on the four new guide pages.

Local link and resource validation
Checked local links/resources across 15 touched pages; no missing local targets or legacy /llm-evaluation.html links.

Python example validation
Ran the A/B sample size, causal difference-in-means, and calibration ECE examples successfully.

Local HTTP checks
Verified 200 responses for /, /blog/, /ai-engineering/, /llm-evaluation/, /data-products/, and the four new guide pages.

Playwright layout checks with system Edge
Verified desktop and mobile H1 rendering and no page-level horizontal overflow for the four new guides and core hub pages.
```

## Manual Follow-up

- After deployment, inspect the four new URLs in Google Search Console.
- Request indexing for the four new guides after confirming the latest `main` commit is deployed.
- Monitor exact queries such as `copilot agent golden test set`, `ab testing sample size python`, `causal inference product analytics`, and `model calibration python`.
- Do not promise ranking positions or timing; evaluate impressions and page ownership over several weeks.

Date: 2026-06-18

## Added

- Expanded `/rag-evaluation-not-a-score.html` into the primary RAG evaluation guide for metrics, test sets, framework comparison, Python examples, citation checks, refusals, and production monitoring.
- Added original RAG evaluation framework diagram at `/img/rag-evaluation-framework.svg`.
- Added dedicated social image at `/img/rag-evaluation-guide-og.png` and repeatable generator script at `scripts/generate_rag_evaluation_images.py`.
- Added synthetic RAG golden dataset and retrieval metrics source:
  - `/assets/rag-evaluation/golden_set.jsonl`
  - `/assets/rag-evaluation/retrieval_metrics.py`
  - `/assets/rag-evaluation/README.md`
- Added `SEO_RAG_DEPLOYMENT_CHECKLIST.md` for post-deployment Google Search Console steps.
- Added `.github/workflows/seo-quality.yml` and `lighthouserc.cjs` for scoped SEO, link, and Lighthouse validation.

## Changed

- Clarified `/llm-evaluation/` as the broad LLM evaluation framework hub while making the RAG article the primary page for RAG evaluation queries.
- Updated internal links from the homepage, blog index, AI Engineering hub, LLM Evaluation hub, and agent-related articles to use contextual, crawlable links.
- Updated RAG article BlogPosting, BreadcrumbList, FAQPage, Open Graph, and Twitter metadata.
- Updated `/llm-evaluation/` WebPage and BreadcrumbList structured data to match the revised page positioning.
- Expanded `scripts/seo_audit.py` with orphan-page warnings, redirect-source URL detection, and social image checks for priority pages.
- Regenerated `sitemap.xml`; it includes `/llm-evaluation/` and `/rag-evaluation-not-a-score.html`, and excludes `/llm-evaluation.html`.

## Validation

```text
python generate_sitemap.py
Generated 61 sitemap URLs.

python scripts\seo_audit.py
SEO audit passed for 61 indexable canonical pages.
Warnings remained for older priority articles that still use a generic social image.

python assets\rag-evaluation\retrieval_metrics.py
Example retrieval metrics printed successfully.

npx --yes linkinator http://127.0.0.1:8081/llm-evaluation/ --skip "https?://(?!127\.0\.0\.1:8081).*" --concurrency 1 --timeout 10000
Successfully scanned 27 links.

npx --yes linkinator http://127.0.0.1:8081/rag-evaluation-not-a-score.html --skip "https?://(?!127\.0\.0\.1:8081).*" --concurrency 1 --timeout 10000
Successfully scanned 34 links.

npx --yes @lhci/cli autorun --config=./lighthouserc.cjs
Exited 0. SEO and accessibility hard gates passed; performance, LCP, and CLS produced warnings.
```

## Manual Follow-up

- Deploy the merged `main` branch.
- Inspect `/llm-evaluation/`, `/llm-evaluation.html`, and `/rag-evaluation-not-a-score.html` in Google Search Console.
- Request indexing for `/llm-evaluation/` and `/rag-evaluation-not-a-score.html`.
- Resubmit `https://yangmingli.com/sitemap.xml`.
- Monitor the exact query `rag evaluation` for page ownership over several weeks.

Date: 2026-05-31

## Added

- New crawlable pillar pages:
  - `/llm-evaluation/`
  - `/machine-learning-nlp.html`
  - `/data-products.html`
  - `/ai-product-builder.html`
  - `/healthcare-ai-analytics.html`
- Expanded `/ai-engineering/` into a full pillar page.
- Sitewide crawlable footer with links to About, Projects, AI Engineering, LLM Evaluation, Machine Learning & NLP, Data Products, AI Product Builder, Blog, Resume, Contact, LinkedIn, and GitHub.
- Homepage "Explore Yangming Li's work" section with normal anchor links.
- Article author blocks linking "Written by Yangming Li" to `/about.html`.
- Article breadcrumbs and related writing blocks.
- `scripts/seo_site_update.py` for repeatable static SEO updates.

## Changed

- Rewrote metadata across public HTML pages to remove weak generated descriptions and improve entity/topic clarity.
- Normalized canonical tags and robots directives.
- Updated `BlogPosting` JSON-LD with author URL, `dateModified`, `mainEntityOfPage`, `articleSection`, and keywords.
- Strengthened homepage and about page entity signals with `Person`, `ProfilePage`, `WebSite`, `sameAs`, `knowsAbout`, and `mainEntity`.
- Added lazy loading/async image decoding and deferred local scripts where safe.
- Updated `generate_sitemap.py` to parse metadata with BeautifulSoup.
- Regenerated `sitemap.xml`.
- Updated `robots.txt`.

## Consolidated

- Canonicalized and redirected `/sentiment-analysis-fine-tune-with-bert2.html` to `/sentiment-analysis-fine-tune-with-bert.html`.
- Kept `/product/` noindexed and redirected to `/blog/`.
- Kept `/focus-room/v1/` noindexed and canonicalized to `/focus-room/`.

## Validation

```text
python generate_sitemap.py
Generated 53 sitemap URLs.

python scripts\seo_audit.py
SEO audit passed for 53 indexable canonical pages.
```
