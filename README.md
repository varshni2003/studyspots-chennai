# StudySpots Chennai

A read-only, mobile-first directory of study-friendly cafés, libraries and coworking spaces in Chennai. Visitors can search, filter, sort, save places in their own browser, share links, open Google Maps and call listed phone numbers. Place information is maintained by the site owner in `src/data/places.json`.

## Run locally

Install the current Node.js LTS release, then run these commands from this folder:

```bash
npm install
npm run dev
```

Open the local address printed by Vite (usually http://localhost:5173).

Before publishing, test the production build:

```bash
npm run typecheck
npm run build
npm run preview
```

The build renders the actual React page content into HTML for every route, then writes `sitemap.xml` and `robots.txt` into `dist/`. This means the page content is present in the initial HTML instead of depending on JavaScript or a `noscript` placeholder. The client app hydrates that HTML in the browser.

## Contact details

The Contact page intentionally shows Instagram only. It does not publish an email address or contact form. To change the Instagram account, edit `OWNER_INSTAGRAM` in `src/App.tsx`.

## Add or update a place

1. Edit `src/data/places.json`. Copy an existing entry and give the new place a unique `id` and URL-friendly `slug`.
2. Use `"Unknown"` for details that have not been confirmed. Do not guess prices, hours, Wi-Fi, power sockets or other amenities.
3. Use a Google Maps search URL in `mapsLink`, following this format: `https://www.google.com/maps/search/?api=1&query=<URL-encoded name, area, Chennai>`.
4. Add source links to `sources` and set `lastChecked` to the date you actually reviewed the information (`YYYY-MM-DD`).
5. Commit and push the change. Vercel will rebuild and publish it automatically when GitHub deployment is connected.

Add only real photographs that you own or have permission to use to `public/images`, then reference their paths in the matching place's `photos` array (for example, `"photos": ["/images/ciclo-cafe.jpg"]`). Cards show a real photo when one is supplied; otherwise they use a clean text-led layout with no generated placeholder artwork. The Ciclo Café image is included in `public/images`.

## Deploy free on Vercel

1. Create a public GitHub repository and push this project to its `main` branch.
2. In Vercel, choose **Add New → Project** and import the GitHub repository. Keep the detected Vite build settings; the build command is `npm run build` and the output directory is `dist`.
3. In **Project → Settings → Environment Variables**, add `SITE_URL` with your exact deployed URL, for example `https://studyspots-chennai.vercel.app` (no trailing slash). Apply it to Production and Preview as appropriate.
4. Redeploy after adding `SITE_URL`. The sitemap and canonical URLs are generated during the build, so the variable must be present when the build runs.
5. In Google Search Console, add the deployed URL as a URL-prefix property and complete Google's ownership verification. Then submit `sitemap.xml` and request indexing for the home page.

The default `SITE_URL` is `https://example.com` for local builds. Set the real value in Vercel before submitting the sitemap to Google.

## Link checking

The GitHub Action in `.github/workflows/links.yml` checks source and Google Maps links weekly and can also be run manually from the repository's **Actions** tab. Some websites block automated requests, so review a reported failure manually before removing a source.
