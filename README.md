# yangmingli.com

Static HTML/CSS/JS personal site and blog for Yangming Li.

## SEO Maintenance

Run the audit before publishing structural or metadata changes:

```bash
python scripts/seo_audit.py
```

Regenerate the sitemap after adding, removing, renaming, canonicalizing, or noindexing pages:

```bash
python generate_sitemap.py
```

The sitemap should contain only canonical, indexable, existing HTML pages. `robots.txt` should continue to point to `https://yangmingli.com/sitemap.xml`.

## API Key Restrictions

The homepage loads Google Maps only when the map area is needed. The Maps JavaScript API key used by the static frontend must be restricted in Google Cloud Console before deployment:

- Application restriction: HTTP referrers limited to `https://yangmingli.com/*` and any intentional preview domains.
- API restriction: Maps JavaScript API only.
- Do not commit or deploy an unrestricted browser key.
