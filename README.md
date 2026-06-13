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

## Newsletter Subscription Setup

The newsletter forms for Yangming AI Systems Notes post directly to a newsletter provider form endpoint. Paste the provider form action URL into `NEWSLETTER_FORM_ACTION_URL` near the top of `js/newsletter.js`.

If you regenerate newsletter markup with `scripts/newsletter_conversion_update.py`, paste the same URL into `NEWSLETTER_FORM_ACTION_URL` near the top of that script before running it.

Use the form action URL from Buttondown, beehiiv, Mailchimp, ConvertKit, or another newsletter provider. Users should subscribe through the website form, not by manually emailing the site owner. Choose a platform that supports confirmation emails, unsubscribe links, and compliant list management.

## API Key Restrictions

The homepage loads Google Maps only when the map area is needed. The Maps JavaScript API key used by the static frontend must be restricted in Google Cloud Console before deployment:

- Application restriction: HTTP referrers limited to `https://yangmingli.com/*` and any intentional preview domains.
- API restriction: Maps JavaScript API only.
- Do not commit or deploy an unrestricted browser key.
