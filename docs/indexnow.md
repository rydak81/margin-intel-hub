# IndexNow

IndexNow tells Bing and the other IndexNow engines (Yandex, Seznam, Naver and others) which pages changed. It does not reach Google; keep using Search Console for that. It costs nothing.

## Pieces
- **Key file:** `app/indexnow-key.txt/route.ts` serves `https://marketplacebeta.com/indexnow-key.txt` from the `INDEXNOW_KEY` environment variable. It returns 404 until the variable holds a valid key (8 to 128 letters, digits or dashes). No key is ever committed.
- **Submitter:** `scripts/indexnow-submit.mjs` (`npm run indexnow -- …`) reads the live sitemap and keeps only marketplacebeta.com URLs. It always drops `/news/*` (syndicated, noindex) and can keep only URLs with `lastmod >= --since`. It **dry-runs by default**: it lists the URLs and sends nothing. With `--submit` it first checks that the live key file serves exactly `INDEXNOW_KEY`, then POSTs to `https://api.indexnow.org/indexnow`, at most 10,000 URLs per request. It never prints the key.

## One-time setup (Ryan)
1. Generate a key: `openssl rand -hex 16`.
2. In Vercel (bpath-projects / v0-vercel-app-update), go to Settings → Environment Variables. Add `INDEXNOW_KEY` for Production, save, then redeploy.
3. Open https://marketplacebeta.com/indexnow-key.txt. It must show exactly the key.

## After each deploy that adds or changes pages
```
INDEXNOW_KEY=<key> npm run indexnow -- --since 2026-11-02            # dry run: review the list
INDEXNOW_KEY=<key> npm run indexnow -- --since 2026-11-02 --submit   # send
INDEXNOW_KEY=<key> npm run indexnow -- --url https://marketplacebeta.com/fees/amazon --submit
```
200 or 202 means received. 400, 403 or 422 means a problem with the key, the key file or the URLs. 429 means too many submissions, so slow down. Submit only changed URLs, not the whole sitemap every time.
