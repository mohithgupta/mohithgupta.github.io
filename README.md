# mohithgupta.github.io

Personal site and portfolio of Mohith Korangi. It is built with Astro as a static site and deployed to GitHub Pages by `.github/workflows/deploy.yml`.

The design idea is a video editing suite:
- The home page opens on a source monitor, which holds the portrait, and a program monitor, which holds the name and pitch.
- A career timeline runs underneath with a playhead you can drag.
  - Tracks are colour-coded: work, study, projects and writing.
  - An inspector lists whatever sits under the playhead.
  - On load the playhead plays from 2018 to now, and the name widens with it.
- Case-study architecture is drawn as compositing node graphs.

## Edit the content

Content and code are kept apart:

| What | File |
|---|---|
| Profile, experience and articles | `src/data/site.ts` |
| Case studies, including architecture nodes and edges | `src/data/projects.ts` |
| The timeline (built from both files above) | `src/data/clips.ts` |
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
