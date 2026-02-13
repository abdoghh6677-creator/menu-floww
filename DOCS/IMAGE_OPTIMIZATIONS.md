Image optimization recommendations

Summary
- Add an image CDN (Cloudflare Images / Imgix / Bunny CDN / ImageKit) and serve thumbnail URLs to reduce payloads.
- Generate and store small thumbnails (e.g., 400w, 800w) and serve WebP/AVIF when supported.
- Use `NEXT_PUBLIC_IMAGE_CDN` env var to point to CDN base — `lib/imageHelpers.js` rewrites URLs when set.

Practical steps
1. Choose a CDN and enable origin pull (or upload assets).
2. Configure domain or secure token; set `NEXT_PUBLIC_IMAGE_CDN` to the CDN base URL (e.g. `https://cdn.example.com`).
3. Serve resized images: request `?w=400&q=75` for cards, `?w=800&q=80` for modals/hero.
4. Convert to modern formats (WebP/AVIF) at the CDN level.
5. Enable caching and aggressive TTL for images.

Next.js integration notes
- We added `lib/imageHelpers.js` which returns rewritten CDN URLs when `NEXT_PUBLIC_IMAGE_CDN` is set.
- Optionally replace `<img>` with `next/image` and set `remotePatterns` in `next.config.js` for the CDN host to enable Next.js built-in optimization.

Deployment (Vercel)
- Ensure environment variables are set in the Vercel project: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_IMAGE_CDN` (optional).
- From local repo, you can use the included script `Deploy-Vercel.ps1` (Windows PowerShell) or `deploy-vercel.sh` (bash) to trigger a deployment if you have the Vercel CLI logged in.

Quick commands (local machine):

PowerShell:

```powershell
# login first: npm i -g vercel && vercel login
./Deploy-Vercel.ps1
```

Bash:

```bash
# login first: npm i -g vercel && vercel login
./deploy-vercel.sh
```

If you prefer CI: connect the GitHub/GitLab repo to Vercel and enable automatic deployments on push to `main`/`prod`.

Notes
- If you want, I can also convert image tags to `next/image` usage throughout the app and update `next.config.js` remotePatterns for the CDN host.
