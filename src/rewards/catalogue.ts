/**
 * Great Empower Marketplace catalogue. All brands, products, vouchers and benefits are FICTIONAL
 * in-game items. Nothing here is a real merchant, product, partnership, insurance cover or
 * real-world redemption. Prices are in Great Empower points (pts).
 */

export type BrandId = "tubway" | "greenbowl" | "fruitfuel" | "careplus" | "shieldora" | "nestora";

/** Eligibility tags drive voucher rules — vouchers never list individual product IDs. */
export type ProductTag =
  | "healthy-food"
  | "wholemeal"
  | "lean-protein"
  | "balanced-bowl"
  | "wrap"
  | "salad"
  | "healthy-drink"
  | "smoothie"
  | "fresh-juice"
  | "low-sugar"
  | "wellness"
  | "game-protection"
  | "game-savings";

export interface Brand {
  id: BrandId;
  name: string;
  tagline: string;
  logo: string;
  kind: "food" | "drink" | "wellness" | "game-benefit";
}

/** A simulated in-game benefit granted by Shieldora / Nestora items. */
export interface GameBenefit {
  type: "medical-expense-reduction" | "protection-level" | "emergency-fund" | "savings-bonus";
  /** Plain-language description of the simulated effect. */
  effect: string;
}

export interface Product {
  id: string;
  brand: BrandId;
  name: string;
  description: string;
  price: number;
  tags: ProductTag[];
  image?: string;
  benefit?: GameBenefit;
}

export interface VoucherDefinition {
  id: string;
  brand?: BrandId;
  title: string;
  description: string;
  /** Points needed to claim the voucher from the Rewards catalogue. */
  cost: number;
  /** Fixed points discount applied at checkout. */
  discount: number;
  /** Product must carry at least one of these tags. */
  eligibleTags: ProductTag[];
  minSpend: number;
  validityDays: number;
}

const brandPath = (id: string) => `/images/lifetrack/marketplace/brands/${id}-logo.png`;
const productPath = (brand: string, file: string) =>
  `/images/lifetrack/marketplace/products/${brand}/${file}-640.webp`;

export const brands: Brand[] = [
  { id: "tubway", name: "TUBWAY", tagline: "Healthy sandwiches, wraps & salads", logo: brandPath("tubway"), kind: "food" },
  { id: "greenbowl", name: "GREENBOWL", tagline: "Balanced meal bowls", logo: brandPath("greenbowl"), kind: "food" },
  { id: "fruitfuel", name: "FRUITFUEL", tagline: "Smoothies, fresh juice & low-sugar drinks", logo: brandPath("fruitfuel"), kind: "drink" },
  { id: "careplus", name: "CAREPLUS", tagline: "Wellness essentials", logo: brandPath("careplus"), kind: "wellness" },
  { id: "shieldora", name: "SHIELDORA", tagline: "Simulated in-game protection benefits", logo: brandPath("shieldora"), kind: "game-benefit" },
  { id: "nestora", name: "NESTORA", tagline: "Simulated in-game savings boosts", logo: brandPath("nestora"), kind: "game-benefit" },
];

export const products: Product[] = [
  { id: "tub-chicken-wholemeal", brand: "tubway", name: "Chicken Wholemeal Sandwich", description: "Grilled chicken and greens on wholemeal bread.", price: 220, tags: ["healthy-food", "wholemeal", "lean-protein"], image: productPath("tubway", "chicken-wholemeal-sandwich") },
  { id: "tub-chicken-wrap", brand: "tubway", name: "Grilled Chicken Wrap", description: "Lean grilled chicken, salad and a light dressing in a wrap.", price: 240, tags: ["healthy-food", "wrap", "lean-protein"], image: productPath("tubway", "grilled-chicken-wrap") },
  { id: "tub-tuna-wholemeal", brand: "tubway", name: "Tuna Wholemeal Sandwich", description: "Tuna and crunchy vegetables on wholemeal bread.", price: 220, tags: ["healthy-food", "wholemeal"], image: productPath("tubway", "tuna-wholemeal-sandwich") },
  { id: "tub-chicken-salad", brand: "tubway", name: "Healthy Chicken Salad", description: "Mixed leaves with sliced grilled chicken.", price: 260, tags: ["healthy-food", "salad", "lean-protein"], image: productPath("tubway", "healthy-chicken-salad") },
  { id: "grb-chicken-bowl", brand: "greenbowl", name: "Grilled Chicken Bowl", description: "Brown rice, grilled chicken and roasted vegetables.", price: 320, tags: ["healthy-food", "balanced-bowl", "lean-protein"], image: productPath("greenbowl", "grilled-chicken-bowl") },
  { id: "grb-salmon-bowl", brand: "greenbowl", name: "Salmon Bowl", description: "Salmon, grains and fresh greens.", price: 380, tags: ["healthy-food", "balanced-bowl", "lean-protein"], image: productPath("greenbowl", "salmon-bowl") },
  { id: "grb-veggie-bowl", brand: "greenbowl", name: "Veggie Bowl", description: "A colourful plant-based bowl.", price: 280, tags: ["healthy-food", "balanced-bowl"], image: productPath("greenbowl", "veggie-bowl") },
  { id: "frf-smoothie", brand: "fruitfuel", name: "Fresh Fruit Smoothie", description: "Blended fresh fruit, no added syrup.", price: 160, tags: ["healthy-drink", "smoothie"], image: productPath("fruitfuel", "fresh-fruit-smoothie") },
  { id: "frf-orange-juice", brand: "fruitfuel", name: "Fresh Orange Juice", description: "Freshly squeezed orange juice.", price: 140, tags: ["healthy-drink", "fresh-juice"], image: productPath("fruitfuel", "fresh-orange-juice") },
  { id: "frf-infused-water", brand: "fruitfuel", name: "Low-Sugar Infused Water", description: "Fruit-infused water with no added sugar.", price: 90, tags: ["healthy-drink", "low-sugar"], image: productPath("fruitfuel", "low-sugar-infused-water") },
  { id: "crp-wellness-pack", brand: "careplus", name: "Wellness Pack", description: "An everyday self-care set (fictional, unbranded).", price: 450, tags: ["wellness"], image: productPath("careplus", "wellness-pack") },
  { id: "crp-basic-health-kit", brand: "careplus", name: "Basic Health Kit", description: "A basic first-aid style kit (fictional).", price: 380, tags: ["wellness"], image: productPath("careplus", "basic-health-kit") },
  { id: "crp-health-check-kit", brand: "careplus", name: "Health Check Kit", description: "Home check essentials (fictional, no medical claims).", price: 520, tags: ["wellness"], image: productPath("careplus", "health-check-kit") },
  { id: "shd-medical-protection", brand: "shieldora", name: "Medical Protection", description: "A simulated medical cover card for your Great Empower game.", price: 600, tags: ["game-protection"], benefit: { type: "medical-expense-reduction", effect: "Reduces one simulated medical expense in the Great Empower game." } },
  { id: "shd-protection-upgrade", brand: "shieldora", name: "Protection Upgrade", description: "Raises your simulated protection level by one step.", price: 900, tags: ["game-protection"], benefit: { type: "protection-level", effect: "Upgrades your simulated protection level in LifeTrack by one step." } },
  { id: "nst-emergency-boost", brand: "nestora", name: "Emergency Fund Boost", description: "Adds a simulated emergency buffer to your in-game savings.", price: 500, tags: ["game-savings"], benefit: { type: "emergency-fund", effect: "Adds a simulated emergency fund at the start of a Great Empower game." } },
  { id: "nst-savings-bonus", brand: "nestora", name: "Savings Bonus", description: "A one-time simulated savings bonus.", price: 400, tags: ["game-savings"], benefit: { type: "savings-bonus", effect: "Grants a one-time simulated savings bonus in the Great Empower game." } },
];

export const voucherDefinitions: VoucherDefinition[] = [
  { id: "v-healthy-meal-80", title: "Healthy Meal · 80 pts off", description: "For sandwiches, wraps, salads and balanced bowls.", cost: 50, discount: 80, eligibleTags: ["healthy-food"], minSpend: 200, validityDays: 30 },
  { id: "v-fresh-drink-50", brand: "fruitfuel", title: "Fresh Drink · 50 pts off", description: "For smoothies, fresh juice and low-sugar drinks.", cost: 30, discount: 50, eligibleTags: ["healthy-drink"], minSpend: 0, validityDays: 30 },
  { id: "v-wellness-120", brand: "careplus", title: "Wellness · 120 pts off", description: "For CarePlus wellness items.", cost: 80, discount: 120, eligibleTags: ["wellness"], minSpend: 380, validityDays: 30 },
  { id: "v-shield-200", brand: "shieldora", title: "Shieldora · 200 pts off", description: "For simulated protection benefits.", cost: 120, discount: 200, eligibleTags: ["game-protection"], minSpend: 600, validityDays: 30 },
  { id: "v-nest-150", brand: "nestora", title: "Nestora · 150 pts off", description: "For simulated savings boosts.", cost: 90, discount: 150, eligibleTags: ["game-savings"], minSpend: 400, validityDays: 30 },
];

/**
 * Points for real activity in this app. Each activity pays once. These rates are new — the
 * project had no earning contract before — and are kept in this one table for review.
 */
export const earningRules = {
  "lesson-complete": { points: 50, label: "Completed a lesson" },
  "video-finished": { points: 40, label: "Watched a video lesson" },
  "infographic-viewed": { points: 20, label: "Studied an infographic" },
  "profile-complete": { points: 100, label: "Completed your protection profile" },
} as const;
export type EarningKind = keyof typeof earningRules;

/** Challenges count distinct earning activities and pay a one-time bonus when completed. */
export const challenges = [
  { id: "keep-learning", title: "Keep Learning", detail: "Complete 3 lessons or videos", kinds: ["lesson-complete", "video-finished"] as EarningKind[], target: 3, bonus: 150 },
  { id: "visual-learner", title: "Visual Learner", detail: "Study 3 infographics", kinds: ["infographic-viewed"] as EarningKind[], target: 3, bonus: 80 },
  { id: "know-your-coverage", title: "Know Your Coverage", detail: "Complete your protection profile", kinds: ["profile-complete"] as EarningKind[], target: 1, bonus: 200 },
];

export const findProduct = (id: string) => products.find((p) => p.id === id);
export const findVoucherDef = (id: string) => voucherDefinitions.find((v) => v.id === id);
export const findBrand = (id: string) => brands.find((b) => b.id === id);
