# Media originals (not deployed)

Full-resolution source files that the app does not load. They were moved here from `public/` on 27 November 2026 so that they are no longer copied into every build and deployment. They are kept for future re-exports.

The paths mirror `public/`. For example, `media-originals/images/lifetrack/lifetrack-cover.jpg` was `public/images/lifetrack/lifetrack-cover.jpg`.

| Original | What the app serves instead |
|---|---|
| `images/lifetrack/marketplace/products/*/*.jpg` (13 × 2048 px) | `public/…/<name>-640.webp` |
| `images/lifetrack/marketplace/brands/*-logo.png` (6 × 2048 px) | `public/…/brands/*-logo.png`, resized to 512 px (same path) |
| `images/lifetrack/lifetrack-cover.jpg` (2400 × 1792; PNG data despite the `.jpg` name) | `lifetrack-cover-960.webp` and `lifetrack-cover-1600.webp` |
| `images/news/mediasas-overview-2027.jpg` (1856 × 2304; PNG data) | `images/news/mediasas/*-1080.webp` and `*-1856.webp` |

Nothing in `src/` may reference this folder: Vite serves and builds only `public/`. To re-export, resize from here and write into `public/`.
