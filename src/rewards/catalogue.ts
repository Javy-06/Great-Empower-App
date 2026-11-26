/**
 * Great Empower Marketplace catalogue. Marketplace brands and products are FICTIONAL in-app items:
 * nothing here is a real merchant, product, partnership, insurance cover or real-world redemption.
 * Prices are in Great Empower points (pts); regular prices start at 1,000 pts.
 *
 * Pricing anchor (v3): about 100 pts per RM1 of an item's estimated everyday value — the ratio the
 * food and drink prices already used (a ~RM12 sandwich = 1,200 pts). CarePlus and the Great Empower
 * Vouchers are priced on the same anchor. See docs/rewards-economy.md for the analysis.
 */

export type BrandId = "tubway" | "greenbowl" | "fruitfuel" | "careplus" | "great-empower" | "shieldora" | "nestora";

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
  | "insurance-voucher"
  | "game-protection"
  | "game-savings";

export interface Brand {
  id: BrandId;
  name: string;
  tagline: string;
  logo?: string;
  kind: "food" | "drink" | "wellness" | "voucher" | "game-benefit";
  /** Retired brands stay listed only so existing history and wallet items still resolve. */
  retired?: boolean;
}

/** A simulated in-game benefit granted by the retired Shieldora / Nestora items. */
export interface GameBenefit {
  type: "medical-expense-reduction" | "protection-level" | "emergency-fund" | "savings-bonus";
  /** Plain-language description of the simulated effect. */
  effect: string;
}

/**
 * A Great Empower Voucher, held in the wallet for FUTURE eligible Great Empower insurance purchases.
 * Insurance purchasing does not exist in the app yet, so a voucher cannot be applied to anything
 * today. Eligible products, expiry, minimum spend and other usage rules are deliberately NOT set
 * here: they will be configured when the purchase feature is built.
 */
export interface VoucherTerms {
  discount: { type: "fixed"; amountRm: number } | { type: "percent"; percent: number; capRm: number };
  /** Short face value shown on the voucher, e.g. "RM10" or "5%". */
  face: string;
  /** How many unused copies of this voucher one account may hold at a time. */
  maxHeld: number;
}

/** Terms shown with every voucher (no expiry or product rules exist yet). */
export const VOUCHER_TERMS = [
  "For future eligible Great Empower insurance purchases. Insurance purchasing is not available in the app yet, so this voucher cannot be used today.",
  "One voucher per purchase. Vouchers cannot be combined with each other.",
  "Eligible products, expiry and any other conditions will be published before vouchers can be used.",
  "You can hold one of each voucher at a time. No cash value, not transferable, and not an insurance policy or a promise of cover.",
];

export interface Product {
  id: string;
  brand: BrandId;
  name: string;
  description: string;
  price: number;
  tags: ProductTag[];
  image?: string;
  benefit?: GameBenefit;
  voucher?: VoucherTerms;
  /** Retired items are no longer offered; kept so past redemptions still display. */
  retired?: boolean;
}

const brandPath = (id: string) => `/images/lifetrack/marketplace/brands/${id}-logo.png`;
const productPath = (brand: string, file: string) =>
  `/images/lifetrack/marketplace/products/${brand}/${file}-640.webp`;

export const brands: Brand[] = [
  { id: "tubway", name: "TUBWAY", tagline: "Healthy sandwiches, wraps & salads", logo: brandPath("tubway"), kind: "food" },
  { id: "greenbowl", name: "GREENBOWL", tagline: "Balanced meal bowls", logo: brandPath("greenbowl"), kind: "food" },
  { id: "fruitfuel", name: "FRUITFUEL", tagline: "Smoothies, fresh juice & low-sugar drinks", logo: brandPath("fruitfuel"), kind: "drink" },
  { id: "careplus", name: "CAREPLUS", tagline: "Wellness essentials", logo: brandPath("careplus"), kind: "wellness" },
  { id: "great-empower", name: "GREAT EMPOWER", tagline: "Vouchers for future Great Empower insurance purchases", kind: "voucher" },
  // Retired in v3: simulated LifeTrack game benefits with no real-world use. Kept for history only.
  { id: "shieldora", name: "SHIELDORA", tagline: "Retired: simulated in-game protection benefits", logo: brandPath("shieldora"), kind: "game-benefit", retired: true },
  { id: "nestora", name: "NESTORA", tagline: "Retired: simulated in-game savings boosts", logo: brandPath("nestora"), kind: "game-benefit", retired: true },
];

export const products: Product[] = [
  { id: "tub-chicken-wholemeal", brand: "tubway", name: "Chicken Wholemeal Sandwich", description: "Grilled chicken and greens on wholemeal bread.", price: 1200, tags: ["healthy-food", "wholemeal", "lean-protein"], image: productPath("tubway", "chicken-wholemeal-sandwich") },
  { id: "tub-chicken-wrap", brand: "tubway", name: "Grilled Chicken Wrap", description: "Lean grilled chicken, salad and a light dressing in a wrap.", price: 1300, tags: ["healthy-food", "wrap", "lean-protein"], image: productPath("tubway", "grilled-chicken-wrap") },
  { id: "tub-tuna-wholemeal", brand: "tubway", name: "Tuna Wholemeal Sandwich", description: "Tuna and crunchy vegetables on wholemeal bread.", price: 1200, tags: ["healthy-food", "wholemeal"], image: productPath("tubway", "tuna-wholemeal-sandwich") },
  { id: "tub-chicken-salad", brand: "tubway", name: "Healthy Chicken Salad", description: "Mixed leaves with sliced grilled chicken.", price: 1400, tags: ["healthy-food", "salad", "lean-protein"], image: productPath("tubway", "healthy-chicken-salad") },
  { id: "grb-chicken-bowl", brand: "greenbowl", name: "Grilled Chicken Bowl", description: "Brown rice, grilled chicken and roasted vegetables.", price: 1600, tags: ["healthy-food", "balanced-bowl", "lean-protein"], image: productPath("greenbowl", "grilled-chicken-bowl") },
  { id: "grb-salmon-bowl", brand: "greenbowl", name: "Salmon Bowl", description: "Salmon, grains and fresh greens.", price: 1900, tags: ["healthy-food", "balanced-bowl", "lean-protein"], image: productPath("greenbowl", "salmon-bowl") },
  { id: "grb-veggie-bowl", brand: "greenbowl", name: "Veggie Bowl", description: "A colourful plant-based bowl.", price: 1500, tags: ["healthy-food", "balanced-bowl"], image: productPath("greenbowl", "veggie-bowl") },
  { id: "frf-smoothie", brand: "fruitfuel", name: "Fresh Fruit Smoothie", description: "Blended fresh fruit, no added syrup.", price: 1100, tags: ["healthy-drink", "smoothie"], image: productPath("fruitfuel", "fresh-fruit-smoothie") },
  { id: "frf-orange-juice", brand: "fruitfuel", name: "Fresh Orange Juice", description: "Freshly squeezed orange juice.", price: 1000, tags: ["healthy-drink", "fresh-juice"], image: productPath("fruitfuel", "fresh-orange-juice") },
  { id: "frf-infused-water", brand: "fruitfuel", name: "Low-Sugar Infused Water", description: "Fruit-infused water with no added sugar.", price: 1000, tags: ["healthy-drink", "low-sugar"], image: productPath("fruitfuel", "low-sugar-infused-water") },
  // CarePlus v3 prices (was 2,000 / 2,400 / 2,800): estimated everyday value ~RM30 / ~RM35 / ~RM45.
  { id: "crp-basic-health-kit", brand: "careplus", name: "Basic Health Kit", description: "A basic first-aid style kit (fictional).", price: 3000, tags: ["wellness"], image: productPath("careplus", "basic-health-kit") },
  { id: "crp-wellness-pack", brand: "careplus", name: "Wellness Pack", description: "An everyday self-care set (fictional, unbranded).", price: 3500, tags: ["wellness"], image: productPath("careplus", "wellness-pack") },
  { id: "crp-health-check-kit", brand: "careplus", name: "Health Check Kit", description: "Home check essentials (fictional, no medical claims).", price: 4500, tags: ["wellness"], image: productPath("careplus", "health-check-kit") },
  // Great Empower Vouchers: 100 pts per RM1 of discount. The 5% voucher is capped at RM30 and
  // priced at that cap, so it is never worth more than its points at the anchor.
  {
    id: "gev-rm10", brand: "great-empower", name: "Great Empower RM10 Voucher", price: 1000, tags: ["insurance-voucher"],
    description: "RM10 off a future eligible Great Empower insurance purchase.",
    voucher: { discount: { type: "fixed", amountRm: 10 }, face: "RM10", maxHeld: 1 },
  },
  {
    id: "gev-rm25", brand: "great-empower", name: "Great Empower RM25 Voucher", price: 2500, tags: ["insurance-voucher"],
    description: "RM25 off a future eligible Great Empower insurance purchase.",
    voucher: { discount: { type: "fixed", amountRm: 25 }, face: "RM25", maxHeld: 1 },
  },
  {
    id: "gev-5pct", brand: "great-empower", name: "Great Empower 5% Voucher", price: 3000, tags: ["insurance-voucher"],
    description: "5% off a future eligible Great Empower insurance purchase, up to RM30 off.",
    voucher: { discount: { type: "percent", percent: 5, capRm: 30 }, face: "5%", maxHeld: 1 },
  },
  {
    id: "gev-rm50", brand: "great-empower", name: "Great Empower RM50 Voucher", price: 5000, tags: ["insurance-voucher"],
    description: "RM50 off a future eligible Great Empower insurance purchase.",
    voucher: { discount: { type: "fixed", amountRm: 50 }, face: "RM50", maxHeld: 1 },
  },
  // Retired in v3 (no longer offered): simulated game benefits. Kept so existing wallet items resolve.
  { id: "shd-medical-protection", brand: "shieldora", name: "Medical Protection", description: "A simulated medical cover card for your Great Empower game.", price: 3000, tags: ["game-protection"], benefit: { type: "medical-expense-reduction", effect: "Reduces one simulated medical expense in the Great Empower game." }, retired: true },
  { id: "shd-protection-upgrade", brand: "shieldora", name: "Protection Upgrade", description: "Raises your simulated protection level by one step.", price: 4500, tags: ["game-protection"], benefit: { type: "protection-level", effect: "Upgrades your simulated protection level in LifeTrack by one step." }, retired: true },
  { id: "nst-emergency-boost", brand: "nestora", name: "Emergency Fund Boost", description: "Adds a simulated emergency buffer to your in-game savings.", price: 2500, tags: ["game-savings"], benefit: { type: "emergency-fund", effect: "Adds a simulated emergency fund at the start of a Great Empower game." }, retired: true },
  { id: "nst-savings-bonus", brand: "nestora", name: "Savings Bonus", description: "A one-time simulated savings bonus.", price: 2000, tags: ["game-savings"], benefit: { type: "savings-bonus", effect: "Grants a one-time simulated savings bonus in the Great Empower game." }, retired: true },
];

/** Items and brands currently offered (retired ones excluded). */
export const activeProducts = products.filter((p) => !p.retired);
export const activeBrands = brands.filter((b) => !b.retired);

/**
 * Welcome Offer eligibility matrix (strict; mirrors reward_products.welcome_eligible in the
 * database): food and drink brands are eligible; wellness, vouchers and game items never are.
 */
export const WELCOME_CATEGORIES: Brand["kind"][] = ["food", "drink"];
/** One-time new-player price for any eligible food or drink item. */
export const WELCOME_PRICE = 200;
export const isWelcomeEligible = (p: Product) =>
  WELCOME_CATEGORIES.includes(brands.find((b) => b.id === p.brand)?.kind ?? "wellness");

/**
 * Points for real activity in this app. Each activity pays once per account. Point values are
 * unchanged in v3; what changed is HOW they are earned (`verification`):
 *  - lesson / infographic: a perfect score on that content's quiz
 *  - video: accumulated valid watch time (cloud: credited by the server, bounded by real time)
 */
export const earningRules = {
  "lesson-complete": { points: 50, label: "Completed a lesson", verification: "quiz" },
  "video-finished": { points: 40, label: "Watched a video lesson", verification: "watch-time" },
  "infographic-viewed": { points: 20, label: "Studied an infographic", verification: "quiz" },
  "profile-complete": { points: 100, label: "Completed your protection profile", verification: "none" },
} as const;
export type EarningKind = keyof typeof earningRules;
export type QuizKind = "lesson-complete" | "infographic-viewed";
/** Activities that can only be earned through verification, never by a direct earn call. */
export const isVerifiedKind = (kind: EarningKind) => earningRules[kind].verification !== "none";

/** Challenges count distinct earning activities and pay a one-time bonus when completed. */
export const challenges = [
  { id: "keep-learning", title: "Keep Learning", detail: "Pass 3 lesson quizzes or finish 3 videos", kinds: ["lesson-complete", "video-finished"] as EarningKind[], target: 3, bonus: 150 },
  { id: "visual-learner", title: "Visual Learner", detail: "Pass 3 infographic quizzes", kinds: ["infographic-viewed"] as EarningKind[], target: 3, bonus: 80 },
  { id: "know-your-coverage", title: "Know Your Coverage", detail: "Complete your protection profile", kinds: ["profile-complete"] as EarningKind[], target: 1, bonus: 200 },
];

export const findProduct = (id: string) => products.find((p) => p.id === id);
export const findBrand = (id: string) => brands.find((b) => b.id === id);
