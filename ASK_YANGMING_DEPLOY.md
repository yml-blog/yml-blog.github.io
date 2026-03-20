# Ask Yangming Deployment

`Ask Yangming` is now split into:

- a static frontend widget in the site
- a serverless backend at `/api/ask-yangming`
- an embedded static site knowledge bundle in `js/ask-yangming.js`

The homepage currently runs the assistant in `static` mode by default, which means it can answer directly from the embedded site knowledge without any backend at all.

## Important

GitHub Pages alone will not execute `api/ask-yangming.js`.

If you want the assistant to answer live questions, deploy this repo on a platform that supports serverless functions, such as Vercel. The static pages still work on GitHub Pages, but the chat backend will not.

If you are happy with a lighter assistant, the current static mode works on GitHub Pages and does not require `OPENAI_API_KEY`.

## Fastest path with Vercel

1. Import this GitHub repo into Vercel.
2. Add an environment variable named `OPENAI_API_KEY`.
3. Optional: add `OPENAI_MODEL`.
   Suggested starting value: `gpt-5`
4. Deploy.

This is the simplest setup because the frontend and `/api/ask-yangming` live on the same origin.

## Split setup: GitHub Pages frontend + Vercel backend

If you want to keep the site frontend on GitHub Pages and host only the API on Vercel:

1. Deploy the repo or just the `api/` code to Vercel.
2. Add `OPENAI_API_KEY` in Vercel.
3. Optional: add `OPENAI_MODEL`.
4. Optional but recommended: add `ASK_YANGMING_ALLOW_ORIGIN` with your site origin, for example `https://yangmingli.com`.
5. In [index.html](./index.html), set `data-api-base` on the `data-ask-yangming` container to your Vercel domain, for example:

```html
<div class="ask-yangming-shell" data-ask-yangming data-api-base="https://your-project.vercel.app">
```

Without that `data-api-base`, the frontend will try to call `/api/ask-yangming` on the same origin as the page, which will fail on GitHub Pages.

## Local development

If you use the Vercel CLI:

```bash
vercel dev
```

Then open the local site and test the widget.

## Customization

- Edit `js/ask-yangming.js` to add or remove grounded static context.
- Edit `api/ask-yangming.js` to tighten or relax the assistant instructions.
- Edit `js/ask-yangming.js` to change quick prompts or frontend behavior.
- Edit `css/ask-yangming.css` to restyle the widget.

## Current behavior

- The static assistant is grounded in embedded site content instead of open-ended web search.
- It returns a short answer plus source links chosen from the embedded site knowledge.
- If the context is insufficient, it should say so and redirect visitors toward contact options.
