# RAG Evaluation SEO Deployment Checklist

Date prepared: 2026-06-18

Use this checklist after the branch is merged and the latest `main` commit is deployed to production. These steps cannot be completed from the repository alone.

## Production Deployment

1. Confirm the latest `main` commit is deployed to `https://yangmingli.com`.
2. Open the deployed pages in a browser:
   - `https://yangmingli.com/llm-evaluation/`
   - `https://yangmingli.com/llm-evaluation.html`
   - `https://yangmingli.com/rag-evaluation-not-a-score.html`
3. Confirm `/llm-evaluation.html` redirects permanently to `/llm-evaluation/`.

## Google Search Console URL Inspection

Inspect these URLs:

- `https://yangmingli.com/llm-evaluation/`
- `https://yangmingli.com/llm-evaluation.html`
- `https://yangmingli.com/rag-evaluation-not-a-score.html`

For each URL, compare:

- User-declared canonical
- Google-selected canonical
- Last crawl
- Crawled page

## Indexing Requests

Request indexing for:

- `https://yangmingli.com/llm-evaluation/`
- `https://yangmingli.com/rag-evaluation-not-a-score.html`

Do not request indexing for the legacy redirect URL except to inspect its redirect/canonical behavior.

## Sitemap

Resubmit:

- `https://yangmingli.com/sitemap.xml`

Confirm the sitemap includes:

- `https://yangmingli.com/llm-evaluation/`
- `https://yangmingli.com/rag-evaluation-not-a-score.html`

Confirm the sitemap does not include:

- `https://yangmingli.com/llm-evaluation.html`

## Query Monitoring

Monitor the exact query:

- `rag evaluation`

Compare which page receives impressions and clicks for that query:

- `/rag-evaluation-not-a-score.html` should be the primary target for RAG evaluation queries.
- `/llm-evaluation/` should remain the broader LLM evaluation hub.

Monitor changes for at least several weeks. Do not promise or assume a ranking position, traffic increase, or ranking deadline.
