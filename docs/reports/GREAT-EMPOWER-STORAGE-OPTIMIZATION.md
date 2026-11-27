# GREAT EMPOWER: storage and asset optimization

**Date:** 27 November 2026
**Branch:** `redesign/overnight-product-refresh`
**Starting HEAD:** `9357c01`

## Summary
| | |
|---|---|
| Files audited in `public/` | 102, plus 6 untracked advisor JPGs (local only; never deployed; protected and untouched) |
| Optimized | 6 brand logos, resized at the same path |
| Removed from the deployed folder | 21 unreferenced originals, **moved** (not deleted) to `media-originals/` |
| Retained unchanged | Everything else, including all 7 videos |
| Deployed `public/` size | **271.4 MB → 190.2 MB, −81.2 MB (−29.9%)** |
| Video | No re-encode (see below) |

Starting state: the working tree was clean apart from the 6 untracked advisor JPGs, which were preserved.

**Vercel storage:** Vercel's Deployment Storage figure does not change until a new deployment is built and its usage metrics refresh. Older deployments keep their own copies until they are deleted.

## Findings against the Vercel report

### A. `what-is-insurance.mp4` is 37.1 MB, not 371 MB
It is the same file in this branch, `main` and Git LFS: 37,056,000 bytes.

| Property | Value |
|---|---|
| Duration | 481 s |
| Video | H.264, 1280×720, 24 fps, ~518 kbps |
| Audio | AAC mono, 44.1 kHz, ~96 kbps |
| Layout | `moov` before `mdat` (already fast-start) |
| Loading | `preload="metadata"` with a poster, so the full file downloads only when a viewer presses play |

At ~0.6 Mbps for 720p it is already a lean encode. Re-encoding these text-heavy explainer slides lower would save perhaps 30–40% at a visible cost to text sharpness. ffmpeg is also not installed here, and no tool was installed. **Decision: left unchanged.** The same holds for the other 6 videos (all H.264/AAC, 0.5–1.0 Mbps).

The videos are now **184.8 MB, 97% of the deployed assets**. The only large remaining saving would be external video hosting, such as a video CDN or object storage. That is an architecture and hosting decision for the owner; nothing was migrated.

### B. Brand logos, 6 × ~6 MB
- **Source:** 2048×2048 RGBA PNGs, with **no transparent pixels** (the minimum alpha is 255).
- **Where they render:** 32–48 px chips. The largest is a fallback at "half a product card" (≤ ~200 CSS px).
- **Fix:** resized to **512×512 PNG at the same path** with high-quality downscaling in halving steps. RGBA is kept.
  - The path is unchanged, so `src/rewards/catalogue.ts` (protected) is not touched.
  - 35.4 MB → **2.19 MB**.
- **Check:** a side-by-side comparison of original and new shows identical proportions, colours and lettering, and the chips render correctly on navy and white.
- **Not done:** not converted to SVG. The sources are raster artwork, not vector, and redrawing them would mean creating new logos.

### C. Marketplace product JPG + WebP pairs (all 13 checked)
- The catalogue builds every product image as `products/<brand>/<file>-640.webp` (`src/rewards/catalogue.ts:85`).
- **No source file, test or script references the `.jpg` originals.** The only mention is the asset manifest document.
- The 640 px WebPs (16–41 KB) are already used and look right at 390/768/1280 px (QA screenshots).
- **Action:** the 13 JPGs (2048 px, 31.0 MB) were moved out of `public/`.

### D. Other large images
| File | Real format | Referenced? | Action |
|---|---|---|---|
| `images/lifetrack/lifetrack-cover.jpg`, 8.3 MB | PNG data, 2400×1792 | No. The app uses `lifetrack-cover-960/1600.webp` (115/236 KB). | Moved out of `public/` |
| `images/news/mediasas-overview-2027.jpg`, 7.1 MB | PNG data, 1856×2304 | Only by an unused data field (`news.ts` `infographic.original`). The page renders the `-1080` / `-1856` WebPs. | Moved; field removed |

Note: the Vercel resource list showed this name as `mediasias`; the file is actually `mediasas`.

**Reviewed and kept** (already small or optimized):
- infographics, 41–329 KB WebP;
- the brand lion and wordmark PNGs, 116–231 KB;
- Pexels photos, 30–132 KB WebP;
- video posters, 27–99 KB.

The brand PNGs are oversized in pixels (up to 3086 px), but they are under 0.5 MB in total and are core brand assets, so they were left alone.

**Not deployed and not touched:** the git-ignored source folders (`insurance study video/`, `insurance infographic/`, `ui reference/`) and the untracked advisor JPGs.

## Asset inventory (changed or large files)
| Path | Type | Size | Referenced | Action | Risk |
|---|---|---|---|---|---|
| `media/learn/videos/foundation-zh.mp4` | MP4 | 49.1 MB | Yes (`learn-media.ts`) | Keep | None |
| `media/learn/videos/foundation-ms.mp4` | MP4 | 41.4 MB | Yes | Keep | None |
| `media/learn/videos/what-is-insurance.mp4` | MP4 | 37.1 MB | Yes | Keep | None |
| `media/learn/videos/foundation-ta.mp4` | MP4 | 29.4 MB | Yes | Keep | None |
| `media/learn/videos/how-insurance-works-in-malaysia.mp4` | MP4 | 12.4 MB | Yes | Keep | None |
| `media/learn/videos/risk-pooling-powers-insurance.mp4`, `life-insurance-risk-pooling.mp4` | MP4 | 7.7 MB each | Yes | Keep | None |
| `images/lifetrack/marketplace/brands/*-logo.png` (6) | PNG | 4.9–6.1 MB → 0.31–0.37 MB | Yes (`brandPath`) | Resized, same path | Low |
| `images/lifetrack/marketplace/products/*/*.jpg` (13) | JPEG | 2.2–2.6 MB each | No | Moved to `media-originals/` | Low |
| `images/lifetrack/marketplace/products/*/*-640.webp` (13) | WebP | 16–41 KB | Yes (`productPath`) | Keep | None |
| `images/lifetrack/lifetrack-cover.jpg` | PNG data | 8.3 MB | No | Moved | Low |
| `images/news/mediasas-overview-2027.jpg` | PNG data | 7.1 MB | Unused field only | Moved; field removed | Low |
| Everything else in `public/` (~60 files) | WebP/PNG | ≤ 329 KB each | Yes | Keep | None |

**How references were checked:**
- literal paths in `src/`, `index.html`, CSS, tests and scripts;
- the path builders (`brandPath`, `productPath`, `ig()`, the advisors template);
- the data files (`catalogue.ts`, `learn-media.ts`, `news.ts`, `notifications.ts`, `advisors.ts`);
- every literal `/images`, `/media` or `/advisor` path in the source exists in `public/`: **0 missing**.

## Before vs after (measured; deployed `public/` = tracked files)
| Group | Before | After | Saved |
|---|---|---|---|
| Brand logos | 35.4 MB | 2.19 MB | 33.2 MB (−94%) |
| Product JPG originals | 31.0 MB | 0 (moved) | 31.0 MB |
| LifeTrack cover original | 8.3 MB | 0 (moved) | 8.3 MB |
| MediAsas original | 7.1 MB | 0 (moved) | 7.1 MB |
| **Total deployed `public/`** | **271.4 MB** | **190.2 MB** | **81.2 MB (−29.9%)** |

The repository size does not shrink: the originals are kept in `media-originals/`, and Git LFS history keeps every version anyway. The saving is in each build and deployment.

## Files changed
- **Moved** (`git mv`, 21 files): `public/images/…` → `media-originals/images/…`:
  - 13 product JPGs;
  - 6 logo originals;
  - `lifetrack-cover.jpg`;
  - `mediasas-overview-2027.jpg`.
- **Added:** 6 resized logos at `public/images/lifetrack/marketplace/brands/*-logo.png`; `media-originals/README.md`; this report.
- **Modified:**
  - `src/data/news.ts`: the unused `original` field and its type entry are removed; the comment points to the original.
  - `docs/lifetrack-marketplace-asset-manifest.md`: storage note.
- **Not modified:** `src/rewards`, `src/calculation-engine`, `src/account`, `supabase`, `public/advisor`, `.env*`, Vercel configuration and settings.

## Validation
| Check | Result |
|---|---|
| TypeScript (`tsc --noEmit`) | Pass |
| Unit tests | 196/196 |
| Production build (device-only) | Pass, no warnings |
| Lint | No lint script in the project (oxfmt formatter only) |
| Missing asset paths | 0 |
| Responsive QA (28 routes × 5 widths) | 0 failures, 0 warnings |
| Playwright smoke + interactions (includes the broken-image check on every route, among them Marketplace and Rewards) | 164 passed, 0 failed |
| Accessibility (axe) | 56 passed, 0 failed |
| Visual regression (includes Rewards) | 12/12 within tolerance |
| Manual review | Marketplace at 390 px: logos in the brand chips and every product photo render; no cropping or distortion |

## Remaining risks
- Logos were checked in the app and in a side-by-side comparison, not on a real phone.
- If anything outside this repository (old links, external docs) points at the moved `.jpg` URLs, those URLs now return 404. No such reference was found in the repo.
- Deleting the originals for good would be the owner's decision. They still live in `media-originals/` and in LFS history.

## Next steps
- **Ready for a Preview deployment.** A push to this branch builds a device-only Preview (guard unchanged).
- After that Preview is built, check the Vercel Deployment Resources list: the moved files should be gone and the logos should be ~0.3–0.4 MB each.
- **Bigger storage wins** need owner decisions:
  1. Delete old Preview deployments. Each one holds its own ~270 MB copy, and the pre-guard ones also need deleting for safety (see `GREAT-EMPOWER-FINAL-CLEANUP.md`).
  2. Consider external hosting for the 185 MB of video.
