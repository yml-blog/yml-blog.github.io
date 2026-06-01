# SEO Changelog

Date: 2026-05-31

## Added

- New crawlable pillar pages:
  - `/llm-evaluation.html`
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
