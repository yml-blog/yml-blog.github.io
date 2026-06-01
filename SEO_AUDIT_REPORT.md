# SEO Audit Report

Date: 2026-05-31  
Site: https://yangmingli.com

## Validation Result

Final local validation passed:

```text
python scripts\seo_audit.py
SEO audit passed for 53 indexable canonical pages.
```

The regenerated sitemap contains 53 canonical, indexable local HTML URLs.

## Pages Fixed

- Core entity pages: `/`, `/about.html`, `/projects.html`, `/blog/`, `/resume.html`, `/contact.html`, `/courses.html`.
- Pillar pages: `/ai-engineering/`, `/llm-evaluation.html`, `/machine-learning-nlp.html`, `/data-products.html`, `/ai-product-builder.html`, `/healthcare-ai-analytics.html`.
- Articles and technical notes across the root, `/engineering/`, and `/leetcode-solutions/` paths.
- Product/app pages: `/focus-room/`, legacy `/focus-room/v1/`, and moved `/product/`.

## Technical SEO Fixes

- Ensured indexable pages have exactly one canonical URL.
- Ensured indexable pages use `index,follow,max-image-preview:large`.
- Rewrote weak generated descriptions that repeated titles, contained UI text such as "Light Dark", or were only bylines.
- Added or normalized Open Graph and Twitter metadata.
- Added valid JSON-LD for `Person`, `ProfilePage`, `WebSite`, `BreadcrumbList`, and `BlogPosting` where appropriate.
- Added visible article author blocks linking to `/about.html`.
- Added visible breadcrumbs and related writing blocks to article pages.
- Added sitewide footer links to Yangming Li, About, Projects, AI Engineering, Blog, Resume, Contact, LinkedIn, and GitHub.
- Added a crawlable homepage "Explore Yangming Li's work" section with normal anchor links.
- Added lazy loading and async decoding to non-critical images where applicable.
- Deferred local script tags where safe.
- Updated `generate_sitemap.py` to parse canonical and robots tags structurally instead of relying on attribute-order-sensitive regex.
- Updated `robots.txt` to point to `https://yangmingli.com/sitemap.xml`.

## Pillar Pages Created or Improved

- `/ai-engineering/` - AI engineering, LLM systems, RAG, MLOps, schema validation, evaluation, and observability.
- `/llm-evaluation.html` - LLM evaluation frameworks, RAG evaluation, schema validation, agent testing, uncertainty, release gates, and monitoring.
- `/machine-learning-nlp.html` - statistical ML, NLP, topic modeling, sentiment analysis, trustworthy ML, and healthcare-style text analytics.
- `/data-products.html` - AI data products, analytics systems, decision support, experiments, and monitoring.
- `/ai-product-builder.html` - AI product builder portfolio themes, launch checklist, product workflow thinking, and trade-offs.
- `/healthcare-ai-analytics.html` - healthcare-style NLP, complaint theme discovery, review workflows, governance, and monitoring.

Each pillar page includes Start here, related writing, internal links, H2 sections, canonical metadata, and BreadcrumbList JSON-LD.

## Intentionally Noindexed or Redirected

- `/sentiment-analysis-fine-tune-with-bert2.html`
  - Reason: duplicate/weak sequel of `/sentiment-analysis-fine-tune-with-bert.html`.
  - Action: `noindex,follow`, canonical to the primary article, and 301 redirect added in both `_redirects` and `vercel.json`.
- `/product/`
  - Reason: moved article index.
  - Action: `noindex,follow`, canonical to `/blog/`, meta refresh fallback, and existing 301 redirect retained.
- `/focus-room/v1/`
  - Reason: legacy prototype flow.
  - Action: `noindex,follow`, canonical to `/focus-room/`.
- `/nha-cai/`
  - Reason: excluded non-brand/non-portfolio legacy path.
  - Action: excluded from sitemap and disallowed in `robots.txt`.
- `google6a208e5b3409387b.html` and `readme.htm`
  - Reason: verification/legacy utility files.
  - Action: excluded from sitemap/audit indexable set.

## Sitemap Consistency

- `sitemap.xml` regenerated from local canonical/indexable HTML pages.
- No noindex pages are included.
- No duplicate canonical URLs are included.
- Moved or obsolete paths are excluded.

## Remaining Issues

- External HTTP status checks were not performed locally; verify important external profile links after deployment.
- Core Web Vitals should be confirmed with Lighthouse or PageSpeed Insights after deployment, especially the homepage cover video experience.
- Google indexing changes depend on recrawl timing after the updated sitemap is submitted.

## Recommended Search Console Actions

1. Submit `https://yangmingli.com/sitemap.xml` in Google Search Console.
2. Use URL Inspection and request indexing for the priority URLs below.
3. Inspect `/sentiment-analysis-fine-tune-with-bert2.html` after deployment to confirm Google sees the redirect/canonical/noindex outcome.
4. Monitor Page indexing for "Duplicate without user-selected canonical" and "Crawled - currently not indexed".
5. Monitor Enhancements/Rich results for structured data validity after Google recrawls.
6. Review Performance queries for branded terms and long-tail topics after 2-4 weeks.

## Priority URLs To Inspect/Request Indexing First

- https://yangmingli.com/
- https://yangmingli.com/about.html
- https://yangmingli.com/projects.html
- https://yangmingli.com/blog/
- https://yangmingli.com/resume.html
- https://yangmingli.com/contact.html
- https://yangmingli.com/ai-engineering/
- https://yangmingli.com/llm-evaluation.html
- https://yangmingli.com/healthcare-ai-analytics.html
- https://yangmingli.com/testing-evaluating-copilot-agents.html
