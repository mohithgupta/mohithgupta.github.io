# mohithgupta.github.io

Personal site and portfolio of Mohith Korangi. It is built with Astro as a static site and deployed to GitHub Pages by `.github/workflows/deploy.yml`.

The design idea is a video editing suite:
- The home page is one editor, the showreel (`src/components/Reel.astro` and `src/scripts/reel.ts`).
  - On load an assistant prompt types a request and the career clips drop onto the timeline.
  - The stage then pins, and scrolling moves the playhead through the stops in `src/data/reel.ts`. A program monitor shows each stop as a title card or a screenshot, with a lower-third caption.
  - Dragging the playhead, clicking a clip, the arrow keys and the play button all move the page scroll, which stays the single source of truth.
  - Time after mid 2025 is stretched on the ruler (dashed line) so the recent projects are readable.
- The Experience page reads like a changelog: each role is a release (v1.0 study to v4.0 Trupeer) and each initiative a commit.
- Case-study architecture is drawn as compositing node graphs.
- The logo is MK between an editor's in and out marks (`public/favicon.svg`, inline in `src/layouts/Base.astro`).

## Edit the content

Content and code are kept apart:

| What | File |
|---|---|
| Profile, experience and articles | `src/data/site.ts` |
| Case studies, including architecture nodes and edges | `src/data/projects.ts` |
| Timeline clips (built from both files above) | `src/data/clips.ts` |
| Showreel stops and monitor frames | `src/data/reel.ts` |
| Screenshots | `src/assets/` (Astro converts them to responsive WebP) |
| Résumé linked from the site | `public/Mohith_Korangi_Resume.pdf` |

The résumé is the public copy without the phone number. Regenerate it with `RESUME_PUBLIC=1 python build.py <dir>` in `linkedin-profile/resume`.

## Run

```bash
npm ci
npm run dev       # http://localhost:4321
npm run build     # astro check + static build into dist/
npm run preview   # serve dist/ on http://localhost:4322
```

## Deploy

Push to `main`. GitHub Pages must be set to deploy from GitHub Actions (Settings, then Pages, then Source: GitHub Actions).
