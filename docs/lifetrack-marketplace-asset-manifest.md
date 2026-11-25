# LifeTrack Marketplace: Asset Manifest

Status: **COMPLETED. All 6 logos and all 13 product photos are in place and verified.**
Last updated: 2026-11-25

This manifest is for planning and tracking. Final files live directly in the project folders listed below.

## Status key

- `PENDING`: not started
- `COMPLETED`: the file exists at its destination and has been verified (valid image, correct size, visually matches the product)
- `FAILED`: could not be produced (with a reason)

## Visual direction (approved 2026-11-25)

Every product image is a photorealistic commercial photograph with the same setup:
- full-frame DSLR look, 100 mm lens, soft natural window light from the left, shallow depth of field
- light warm-grey stone surface and soft off-white background
- product centred with breathing room, square 1:1
- no text, no labels, no logos, no price tags, no watermarks

Wellness items use plain, unbranded packaging, make no medical claims, and show devices with blank screens.
All products are fictional, illustrative in-game items. No real products, partnerships or real-world redemption are implied.

Generated with Gemini (model "Hydrogen 高"), all in one chat. The full-size downloads are 2048×2048 JPEGs, so the product files use `.jpg`. Converting to `.png` would only make the files larger, with no quality gain.

---

## A. Brand logos: `public/images/lifetrack/marketplace/brands/`

These are the existing logos from `C:\Users\Javy\Downloads\*-logo.jpg`. Those files are really PNG data, so they were copied byte-for-byte under `.png` names, not regenerated. The originals were left in place.

| ID | Asset | Type | Filename | Status |
| --- | --- | --- | --- | --- |
| LOGO-01 | Tubway logo | logo | `tubway-logo.png` | COMPLETED |
| LOGO-02 | GreenBowl logo | logo | `greenbowl-logo.png` | COMPLETED |
| LOGO-03 | FruitFuel logo | logo | `fruitfuel-logo.png` | COMPLETED |
| LOGO-04 | CarePlus logo | logo | `careplus-logo.png` | COMPLETED |
| LOGO-05 | Shieldora logo | logo | `shieldora-logo.png` | COMPLETED |
| LOGO-06 | Nestora logo | logo | `nestora-logo.png` | COMPLETED |

---

## B. Product photos: `public/images/lifetrack/marketplace/products/<store>/`

| ID | Store | Product | Filename | Destination | Status |
| --- | --- | --- | --- | --- | --- |
| TUB-01 | Tubway | Chicken Wholemeal Sandwich | `chicken-wholemeal-sandwich.jpg` | `products/tubway/` | COMPLETED |
| TUB-02 | Tubway | Grilled Chicken Wrap | `grilled-chicken-wrap.jpg` | `products/tubway/` | COMPLETED |
| TUB-03 | Tubway | Tuna Wholemeal Sandwich | `tuna-wholemeal-sandwich.jpg` | `products/tubway/` | COMPLETED |
| TUB-04 | Tubway | Healthy Chicken Salad | `healthy-chicken-salad.jpg` | `products/tubway/` | COMPLETED |
| GRB-01 | GreenBowl | Grilled Chicken Bowl | `grilled-chicken-bowl.jpg` | `products/greenbowl/` | COMPLETED |
| GRB-02 | GreenBowl | Salmon Bowl | `salmon-bowl.jpg` | `products/greenbowl/` | COMPLETED |
| GRB-03 | GreenBowl | Veggie Bowl | `veggie-bowl.jpg` | `products/greenbowl/` | COMPLETED |
| FRF-01 | FruitFuel | Fresh Fruit Smoothie | `fresh-fruit-smoothie.jpg` | `products/fruitfuel/` | COMPLETED |
| FRF-02 | FruitFuel | Fresh Juice (orange) | `fresh-orange-juice.jpg` | `products/fruitfuel/` | COMPLETED |
| FRF-03 | FruitFuel | Low-Sugar Drink (infused water) | `low-sugar-infused-water.jpg` | `products/fruitfuel/` | COMPLETED |
| CRP-01 | CarePlus | Wellness Pack | `wellness-pack.jpg` | `products/careplus/` | COMPLETED |
| CRP-02 | CarePlus | Basic Health Kit | `basic-health-kit.jpg` | `products/careplus/` | COMPLETED |
| CRP-03 | CarePlus | Health Check Kit | `health-check-kit.jpg` | `products/careplus/` | COMPLETED |

### What each photo shows

- **TUB-01:** Wholegrain sandwich cut into two triangles, with grilled chicken breast, lettuce, tomato and cucumber, on parchment paper.
- **TUB-02:** Wholemeal tortilla wrap cut in half, with grilled chicken, romaine, carrot, tomato and cucumber, and a thin yoghurt dressing.
- **TUB-03:** Wholegrain sandwich triangles with a light tuna filling, lettuce, red onion, cucumber and tomato.
- **TUB-04:** Clear takeaway bowl of mixed leaves with grilled chicken, cherry tomato, cucumber, carrot, corn and avocado, plus a separate dressing cup.
- **GRB-01:** Stoneware bowl of brown rice with sliced grilled chicken, broccoli, roasted sweet potato, cherry tomato, cucumber and spinach.
- **GRB-02:** Brown rice and quinoa with a pan-seared salmon fillet, edamame, cucumber, purple cabbage, avocado and spring onion.
- **GRB-03:** Quinoa and brown rice with tofu, chickpeas, pumpkin, broccoli, red cabbage, cucumber, avocado and spinach.
- **FRF-01:** Berry-banana smoothie in a tall glass with a paper straw, with fresh berries and a banana beside it.
- **FRF-02:** Freshly squeezed orange juice in a tall glass, with a halved orange and a whole orange.
- **FRF-03:** Iced water infused with cucumber, lemon and mint, with lemon slices, cucumber and mint beside it.
- **CRP-01:** White gift box with a teal lining holding a plain supplement bottle, a steel water bottle, hand sanitiser and face masks.
- **CRP-02:** Teal zip first-aid pouch with bandages, gauze, tape, wipes and scissors. The only marking is a white cross.
- **CRP-03:** White case with an upper-arm blood-pressure monitor, a thermometer and a pulse oximeter. All screens are blank.

## Verification (2026-11-25)

- All 13 product files are valid 2048×2048 JPEGs, between about 2.35 MB and 2.65 MB each, and each has a different file size.
- Each file was checked visually against its product name.
- No existing files were overwritten.
- No application code was changed. Nothing in the app references these images yet.
