/**
 * Protection education content: five insurance categories with two names each (the official
 * category and the financial protection purpose), plus researched products.
 *
 * Accuracy rules (see report/insurance-phase/ and report/preview-validation/):
 *  - General statements are phrased generally ("may", "usually", "check your policy"); every
 *    Malaysia-specific fact carries a source.
 *  - Products are limited to the 8 records the audited Product Master (22 Nov 2026) marks
 *    VERIFIED_OFFICIAL, plus one issuer notice. Every displayed fact was re-checked against the
 *    current official Great Eastern page or PDS on 27 Nov 2026
 *    (report/preview-validation/Insurance_Content_Verification_Report.md). Anything not
 *    confirmed there is listed as "needs official confirmation".
 *  - No prices, premiums or quotes are shown except a minimum premium printed on an official page,
 *    labelled as not a quote. No ranking and no "for you" product suggestions.
 */

import type { GeIconName } from "../components/illustrations/GeIcons";

/** Real photography for a category hero (Pexels licence: free to use, credit given anyway). */
export interface HeroPhoto {
  src: string;
  /** CSS object-position for the crop. */
  position: string;
  credit: { photographer: string; url: string };
}

export type ProtectionSlug = "medical" | "critical-illness" | "life" | "tpd" | "personal-accident";

export interface Source {
  label: string;
  url: string;
}

export interface ProtectionCategory {
  slug: ProtectionSlug;
  /** Official insurance category. */
  official: string;
  /** Financial protection purpose (GREAT EMPOWER's plain-language layer). */
  purpose: string;
  short: string;
  /** The life event, in 2–4 words (visual overview). */
  event: string;
  /** The money problem it creates, in 2–5 words. */
  problem: string;
  summary: string;
  example: { title: string; text: string };
  mayHelp: string[];
  /** The category's icon in the GREAT EMPOWER icon set. */
  iconName: GeIconName;
  /** One icon per mayHelp item (same order). */
  mayHelpIcons: GeIconName[];
  /** Short scannable title for each mayHelp item (same order). */
  mayHelpTitles: string[];
  /** Short scannable title for each notAutomatic item (same order). */
  notAutomaticTitles: string[];
  photo: HeroPhoto;
  notAutomatic: string[];
  misunderstandings: Array<{ myth: string; reality: string }>;
  /** "Not the same as" distinctions the brief requires (e.g. Life ≠ debt cancellation). */
  notEqual: Array<{ a: string; b: string; why: string }>;
  malaysia?: Array<{ text: string; source: Source }>;
  infographicId?: string;
  scenario?: { label: string; href: string; text: string };
  sources: Source[];
}

const S = {
  bnmCopay: { label: "BNM — medical and health insurance/takaful co-payment requirements", url: "https://www.bnm.gov.my/-/mhit-req-en" },
  bnmBase: { label: "BNM — Medical and health insurance/takaful (MHIT) and MediAsas", url: "https://www.bnm.gov.my/mhit" },
  mediasasFaq: { label: "BNM — MediAsas FAQs, Version 1: Pilot Programme (29 July 2026, PDF)", url: "https://www.bnm.gov.my/documents/20124/22555060/MediAsas_Pilot_FAQs_Customers.pdf" },
  bnmDirect: { label: "BNM — direct distribution channels for pure protection products", url: "https://www.bnm.gov.my/-/direct-distribution-channels-for-pure-protection-products-1" },
  pidm: { label: "PIDM — Takaful and Insurance Benefits Protection System (TIPS)", url: "https://www.pidm.gov.my/general/how-we-protect-you/takaful-and-insurance-benefits-protection-system" },
  glossary: { label: "InsuranceInfo (BNM) — insurance glossary", url: "https://insuranceinfo.com.my/learn-the-basics/insurance-glossary/" },
  star: { label: "The Star — When coverage runs thin (24 May 2026)", url: "https://thestar.com.my/news/focus/2026/05/24/when-coverage-runs-thin" },
  fmos: { label: "Financial Markets Ombudsman Service (FMOS)", url: "https://www.fmos.org.my/" },
} satisfies Record<string, Source>;

export const protectionSources = S;

export const protectionCategories: ProtectionCategory[] = [
  {
    slug: "medical",
    iconName: "heartPulse",
    event: "Hospital stay",
    problem: "Big hospital bills",
    official: "Medical & Hospitalisation",
    purpose: "Medical Expense Protection",
    short: "Helps pay eligible hospital and treatment bills.",
    summary:
      "Pays eligible hospital and surgical bills, up to the plan's limits, after any deductible or co-payment that applies. Often called a “medical card”. The takaful version is medical takaful.",
    example: {
      title: "Example situation (illustrative)",
      text:
        "Aina, 24, is admitted to a private hospital for appendicitis. Because her hospital is on her insurer's panel, it can bill the insurer directly through a Guarantee Letter. She may still pay a deductible or co-payment, and anything above her plan's limits or outside its cover.",
    },
    mayHelp: [
      "Your hospital room, up to a daily limit.",
      "Treatment and supplies for an eligible admission.",
      "Some pre- and post-hospital treatment, and certain outpatient care, depending on the plan.",
      "At panel hospitals, a Guarantee Letter (GL) means you may not pay the full bill upfront.",
    ],
    mayHelpIcons: ["bed","scalpel","stethoscope","letter"],
    mayHelpTitles: ["Room and board","Surgery and medicine","Before and after care","Direct billing"],
    photo: { src: "/images/pexels/protection-medical-hospital-rest.webp", position: "62% 40%", credit: { photographer: "Andrea Piacquadio", url: "https://www.pexels.com/photo/photo-of-woman-lying-in-hospital-bed-3769151/" } },
    notAutomaticTitles: ["Every cost","Pre-existing conditions","Waiting period","Lost income","Your share"],
    notAutomatic: [
      "Annual limits, sub-limits, room limits and exclusions still apply.",
      "Conditions you had before buying — especially if not disclosed.",
      "Illness in the period right after cover starts.",
      "Your salary while you recover.",
      "Any deductible or co-payment you agreed to pay.",
    ],
    misunderstandings: [
      { myth: "“I have insurance, so my hospital bill will be zero.”", reality: "Insurance coverage isn't the same as zero cost. Deductibles, co-payment, limits and exclusions can leave part of the bill for you." },
      { myth: "“My employer's cover protects me for good.”", reality: "Employer cover depends on the employer's scheme and usually ends when you leave the job." },
      { myth: "“A medical card replaces my salary while I'm sick.”", reality: "It pays eligible medical bills. It doesn't pay you an income." },
    ],
    notEqual: [{ a: "Medical insurance", b: "All medical expenses covered", why: "Only eligible costs within the plan's limits are paid, after any amount you share." }],
    malaysia: [
      { text: "Since 1 September 2024, insurers and takaful operators must offer an option to buy medical cover with co-payment. Plans without co-payment can still be sold, so check which one you have.", source: S.bnmCopay },
      { text: "Where co-payment applies, BNM says it does not apply to emergency treatment (including accidents), outpatient follow-up for critical illnesses such as cancer or kidney dialysis, or treatment at a government healthcare facility.", source: S.bnmCopay },
      { text: "MediAsas, BNM's standardised base medical plan, is being piloted. Its national launch is scheduled for January 2027, when final features and pricing are to be published.", source: S.bnmBase },
    ],
    infographicId: "medical-insurance-malaysia",
    scenario: { label: "Open the medical bill simulator", href: "app/simulate/needs/tool-bill", text: "See how a deductible, co-payment and an annual limit split a hospital bill." },
    sources: [S.bnmCopay, S.bnmBase, S.mediasasFaq, S.glossary, S.star],
  },
  {
    slug: "critical-illness",
    iconName: "ribbon",
    event: "Serious illness diagnosis",
    problem: "Treatment costs and time off work",
    official: "Critical Illness",
    purpose: "Critical Illness Recovery",
    short: "A lump sum if you're diagnosed with a covered illness.",
    summary:
      "Pays a one-off lump sum if you are diagnosed with an illness listed in the policy and the diagnosis meets the policy's definition. You decide how to use the money.",
    example: {
      title: "Example situation (illustrative)",
      text:
        "Wei Ming, 29, is diagnosed with a covered cancer and stops working for treatment. His medical card pays eligible hospital bills; a critical illness payout, if approved, gives him a lump sum for rent, loan repayments and recovery costs. Whether it lasts depends on its size and his costs.",
    },
    mayHelp: [
      "Paid for a listed illness — such as certain cancers, heart attack or stroke — when the definition is met.",
      "Living costs, debts or recovery while you can't work.",
      "Some plans pay for early-stage diagnoses or allow more than one claim.",
    ],
    mayHelpIcons: ["cash","home","steps"],
    mayHelpTitles: ["Lump sum on diagnosis","Spend it your way","Early-stage or repeat claims"],
    photo: { src: "/images/pexels/protection-critical-illness-recovery.webp", position: "30% 35%", credit: { photographer: "Michelle Leman", url: "https://www.pexels.com/photo/happy-asian-woman-suffering-from-cancer-near-window-6798572/" } },
    notAutomaticTitles: ["A monthly salary","Every illness","Waiting period","Hospital bills"],
    notAutomatic: [
      "The lump sum is fixed and may run out.",
      "Only listed conditions that meet the definition and severity.",
      "Diagnoses during the period right after cover starts.",
      "Paying the hospital directly is what medical insurance does.",
    ],
    misunderstandings: [
      { myth: "“Critical illness cover replaces my income.”", reality: "It pays a one-off amount. How long it lasts depends on the amount and your costs — try the recovery runway scenario." },
      { myth: "“My medical card already covers a serious illness.”", reality: "A medical card pays eligible hospital bills. Living costs and lost income during recovery are not covered by it." },
      { myth: "“Any stage of a listed illness qualifies.”", reality: "Definitions, stages and severity matter. Some plans pay only for advanced stages." },
    ],
    notEqual: [{ a: "Critical illness cover", b: "Income replacement", why: "A lump sum on diagnosis is not a regular salary, and it isn't paid for every reason you might stop working." }],
    infographicId: "critical-illness-malaysia",
    scenario: { label: "Try the recovery runway scenario", href: "app/simulate/needs/tool-ci", text: "Compare a critical illness amount with a recovery period you choose." },
    sources: [S.glossary],
  },
  {
    slug: "life",
    iconName: "family",
    event: "A breadwinner dies",
    problem: "Family loses their support",
    official: "Life",
    purpose: "Family Financial Protection",
    short: "A lump sum for the people who depend on you.",
    summary:
      "Pays a lump sum to your nominee or estate if you die during the cover period, subject to the policy's terms and exclusions. Many plans also pay on total and permanent disability (TPD). Family takaful is the takaful equivalent.",
    example: {
      title: "Example situation (illustrative)",
      text:
        "Daniel, 30, sends RM400 a month to his parents and has a car loan. If he died, a life payout to his nominee could help replace that support and settle his affairs. A 22-year-old with no dependants and no debts may need much less life cover.",
    },
    mayHelp: [
      "Support for parents, a partner or children who rely on your income.",
      "Funeral costs and settling outstanding commitments.",
      "Affordable, pure protection for a fixed period.",
      "Longer cover with savings or investment values that may not be guaranteed.",
    ],
    mayHelpIcons: ["family","receipt","calendar","chart"],
    mayHelpTitles: ["Your dependants","Final expenses","Term life","Whole life or investment-linked"],
    photo: { src: "/images/pexels/protection-family-living-room.webp", position: "50% 45%", credit: { photographer: "Annushka Ahuja", url: "https://www.pexels.com/photo/family-on-a-living-room-8055807/" } },
    notAutomaticTitles: ["Debt cancellation","Payouts while alive","Guaranteed investment values"],
    notAutomatic: [
      "The payout goes to your nominee or estate, not straight to your lenders.",
      "Only if the plan adds a TPD or critical illness benefit.",
      "Investment-linked values may not be guaranteed.",
    ],
    misunderstandings: [
      { myth: "“Life insurance pays off my loans.”", reality: "Not automatically. Loan-linked cover (such as mortgage reducing term cover) is a separate type of policy." },
      { myth: "“Everyone needs a big life policy straight away.”", reality: "Life cover matters most when others depend on you — for example after marriage, children, a mortgage or co-signed loans." },
      { myth: "“The illustration in my investment-linked plan is guaranteed.”", reality: "Sales illustrations are projections. Charges and investment returns can change the outcome." },
    ],
    notEqual: [{ a: "Life insurance", b: "Debt cancellation", why: "Debts don't disappear automatically. A payout goes to your nominee or estate, who may use it to settle them." }],
    malaysia: [
      { text: "If an insurer or takaful operator that is a PIDM member fails, eligible life insurance benefits are protected up to RM500,000 under TIPS.", source: S.pidm },
    ],
    infographicId: "life-insurance-malaysia",
    scenario: { label: "Try the family protection scenario", href: "app/simulate/needs/tool-family", text: "Estimate what your dependants might need and compare it with cover you count." },
    sources: [S.pidm, S.glossary],
  },
  {
    slug: "tpd",
    iconName: "walletPause",
    event: "Can never work again",
    problem: "Income stops for good",
    official: "Total and Permanent Disability (TPD)",
    purpose: "Income Protection",
    short: "A benefit if you can never work again.",
    summary:
      "Pays a benefit if illness or injury leaves you totally and permanently unable to work, as defined in the policy. It is often included with life insurance and usually paid as a lump sum.",
    example: {
      title: "Example situation (illustrative)",
      text:
        "Priya, 27, is seriously injured and can no longer do any work. If her condition meets her policy's TPD definition, a payout could support her for the years she can't earn. A shorter, temporary injury would not usually qualify.",
    },
    mayHelp: [
      "Usually a lump sum, sometimes paid in instalments.",
      "Either cause counts, if it meets the policy's definition.",
    ],
    mayHelpIcons: ["cash","shieldCheck"],
    mayHelpTitles: ["If you can't work again","Illness or accident"],
    photo: { src: "/images/pexels/protection-income-planning.webp", position: "55% 30%", credit: { photographer: "ANTONI SHKRABA production", url: "https://www.pexels.com/photo/a-businessman-with-documents-on-the-table-8374283/" } },
    notAutomaticTitles: ["Temporary or partial disability","A monthly salary","Cover at every age","Immediate claims"],
    notAutomatic: [
      "It must meet the policy's definition of total and permanent.",
      "Unless the policy says so.",
      "TPD cover often ends at an age stated in the policy.",
      "Some definitions require the disability to last a minimum period first.",
    ],
    misunderstandings: [
      { myth: "“Any injury that stops me working counts.”", reality: "Only a disability that meets the policy's total and permanent definition qualifies." },
      { myth: "“TPD and income protection are the same.”", reality: "Income protection products pay a regular income while you can't work. TPD usually pays a lump sum." },
      { myth: "“A TPD claim leaves my life cover untouched.”", reality: "If TPD is bundled with life cover, a TPD payout may reduce or end the death benefit. Check how your policy works." },
    ],
    notEqual: [{ a: "TPD cover", b: "A monthly salary", why: "It usually pays a lump sum, and only for a disability that meets the definition." }],
    scenario: { label: "Check your emergency fund", href: "app/simulate/needs/tool-fund", text: "See how many months your savings could cover essentials. (A TPD calculator needs an approved model first.)" },
    sources: [S.glossary, S.pidm],
  },
  {
    slug: "personal-accident",
    iconName: "bandage",
    event: "An accident",
    problem: "Injury costs or disability",
    official: "Personal Accident",
    purpose: "Accident Protection",
    short: "Benefits for injury or death caused by an accident.",
    summary:
      "Pays benefits for death or disablement caused solely by an accident, as defined in the policy, and may reimburse accident-related medical costs. Usually a one-year policy you renew.",
    example: {
      title: "Example situation (illustrative)",
      text:
        "Hafiz, 21, rides to work and fractures his wrist in a fall. A personal accident policy may reimburse accident medical costs up to its limit, and pay a set percentage of the sum insured if an injury causes permanent disablement.",
    },
    mayHelp: [
      "A payout if an accident causes death.",
      "A percentage of the sum insured, depending on how severe it is.",
      "Treatment after an accident, up to a limit.",
      "Sometimes a daily amount while in hospital after an accident.",
    ],
    mayHelpIcons: ["shieldPlus","percent","bandage","calendarCoin"],
    mayHelpTitles: ["Accidental death","Permanent disablement","Accident medical bills","Hospital income"],
    photo: { src: "/images/pexels/protection-accident-rider.webp", position: "50% 40%", credit: { photographer: "Erik Mclean", url: "https://www.pexels.com/photo/man-on-motorcycle-in-city-10125985/" } },
    notAutomaticTitles: ["Illness","Every activity","Illness hospital stays"],
    notAutomatic: [
      "Unless the policy adds a specific extension.",
      "Exclusions often apply, for example certain hazardous activities.",
      "Non-accident stays need medical insurance.",
    ],
    misunderstandings: [
      { myth: "“PA covers me if I'm hospitalised for an illness.”", reality: "Personal accident covers accidents. Illness generally needs medical insurance." },
      { myth: "“A cheap PA plan is all the protection I need.”", reality: "It's useful but narrow. It doesn't cover illness or replace medical, life or critical illness cover." },
      { myth: "“My job doesn't matter.”", reality: "Your occupation can affect whether you're accepted and what you pay." },
    ],
    notEqual: [{ a: "Personal accident cover", b: "Medical insurance", why: "It is triggered only by accidents, so most hospital stays for illness are not covered." }],
    infographicId: "personal-accident-malaysia",
    scenario: { label: "Open the medical bill simulator", href: "app/simulate/needs/tool-bill", text: "See how a hospital bill is shared — PA medical limits are usually much lower than a medical plan's." },
    sources: [S.glossary],
  },
];

export const findProtectionCategory = (slug: string) => protectionCategories.find((c) => c.slug === slug);

/* ----------------------------------------------------------------------------- researched products */

export type EvidenceStatus = "VERIFIED_OFFICIAL" | "ISSUER_NOTICE";

export interface ResearchedProduct {
  id: string;
  name: string;
  issuer: string;
  basis: "Conventional insurance" | "Takaful";
  categories: ProtectionSlug[];
  type: string;
  status: string;
  howToApply: string;
  /** Only fields the Product Master marks VERIFIED_OFFICIAL, with where they come from. */
  verifiedFacts: Array<{ label: string; value: string }>;
  needsConfirmation: string[];
  note?: string;
  evidence: EvidenceStatus;
  sources: Source[];
}

const GELM = "Great Eastern Life Assurance (Malaysia) Berhad";
const GEGM = "Great Eastern General Insurance (Malaysia) Berhad";
const GETB = "Great Eastern Takaful Berhad";

export const PRODUCT_RESEARCH_DATE = "27 November 2026";

export const researchedProducts: ResearchedProduct[] = [
  {
    id: "GEGM-IND-MED-PORTFOLIO",
    name: "Individual medical products (GEGM) — notice",
    issuer: GEGM,
    basis: "Conventional insurance",
    categories: ["medical"],
    type: "Issuer notice about a product portfolio, not a product",
    status: "Great Eastern General stopped accepting new applications for its individual medical products from 1 November 2026. Existing policies continue to be renewed, claimed and serviced under their terms.",
    howToApply: "No new applications for this portfolio. Great Eastern Life and Great Eastern Takaful products are not affected by this notice.",
    verifiedFacts: [],
    needsConfirmation: ["Which individual products the notice covers (none are named)"],
    evidence: "ISSUER_NOTICE",
    sources: [{ label: "Great Eastern — important update on individual medical insurance products", url: "https://www.greateasternlife.com/my/en/customer-services/announcements/important-update-on-individual-medical-insurance-products.html" }],
  },
  {
    id: "GELM-SHP",
    name: "SMART Health Protector",
    issuer: GELM,
    basis: "Conventional insurance",
    categories: ["medical"],
    type: "Medical rider attached to selected regular-premium investment-linked plans (not sold on its own)",
    status: "Shown on the official product page (information correct as on 1 October 2026).",
    howToApply: "The official page offers a call-back from a Life Planning Advisor; it doesn't describe an online application.",
    verifiedFacts: [
      { label: "Annual limit (official page)", value: "RM3,000,000" },
      { label: "Lifetime limit (official page)", value: "No overall lifetime limit" },
      { label: "Deductible (official page)", value: "Options starting from RM500 per policy year" },
      { label: "Entry age (official page)", value: "14 days to 70 years next birthday (59 for one deductible option)" },
    ],
    needsConfirmation: ["Current PDS and policy wording", "Waiting periods and exclusions", "Which base plans it can attach to", "Your cost of insurance"],
    evidence: "VERIFIED_OFFICIAL",
    sources: [{ label: "Great Eastern Life — SMART Health Protector", url: "https://www.greateasternlife.com/my/en/personal-insurance/our-products/health-insurance/smart-health-protector.html" }],
  },
  {
    id: "GELM-GMV",
    name: "GREAT MediValue",
    issuer: GELM,
    basis: "Conventional insurance",
    categories: ["medical"],
    type: "Medical rider attached to selected regular-premium investment-linked plans",
    status: "Shown on the official product page (information correct as on 11 May 2026).",
    howToApply: "The official page offers a call-back from a Life Planning Advisor; it doesn't describe an online application.",
    verifiedFacts: [
      { label: "PDS version checked", value: "V00/0526 (Plan 200)" },
      { label: "Annual limit (PDS and official page)", value: "RM3,000,000" },
      { label: "Lifetime limit (PDS)", value: "No limit" },
      { label: "Room and board (PDS)", value: "RM200 per day" },
      { label: "Deductible (PDS)", value: "RM500 or RM2,500 per policy year" },
      { label: "Co-insurance (PDS)", value: "Hospital and surgical: 20% up to RM20,000 per policy year, if applicable" },
      { label: "Waiting periods (PDS)", value: "30 days for illness; 120 days for specified illnesses" },
      { label: "Renewal (PDS)", value: "Renewal is guaranteed; the cost of insurance is not" },
    ],
    needsConfirmation: ["Coverage term (the PDS shows a placeholder: age 80 or 100 next birthday)", "Full policy wording and exclusions", "Your cost of insurance"],
    evidence: "VERIFIED_OFFICIAL",
    sources: [
      { label: "Great Eastern Life — GREAT MediValue PDS (PDF)", url: "https://www.greateasternlife.com/content/dam/corp-site/my/malaysia/gelm-mcm-marcom/product-/product-disclosure-sheet/gelm-mmc-pd-gmv-pds.pdf" },
      { label: "Great Eastern Life — GREAT MediValue", url: "https://www.greateasternlife.com/my/en/personal-insurance/our-products/health-insurance/great-medivalue.html" },
    ],
  },
  {
    id: "GELM-GMS2",
    name: "GREAT Medic Shield 2",
    issuer: GELM,
    basis: "Conventional insurance",
    categories: ["medical"],
    type: "Yearly renewable standalone medical plan",
    status: "Shown on the official product page (information correct as on 1 June 2026). The page doesn't say whether it's open to new applicants.",
    howToApply: "Not stated on the product page — confirm with Great Eastern Life.",
    verifiedFacts: [
      { label: "Annual limit (official page)", value: "Up to RM150,000, no overall lifetime limit (terms and conditions apply)" },
      { label: "Deductible (official page)", value: "RM300 per disability" },
      { label: "Room and board (official page)", value: "Up to RM200 per day" },
      { label: "Renewal (official page)", value: "Renewable until age 100 next birthday" },
    ],
    needsConfirmation: ["Whether it's open to new applicants", "Entry age and eligibility", "Current PDS (the one found has placeholder dates)", "Waiting periods and exclusions", "Your premium"],
    evidence: "VERIFIED_OFFICIAL",
    sources: [{ label: "Great Eastern Life — GREAT Medic Shield 2", url: "https://www.greateasternlife.com/my/en/personal-insurance/our-products/health-insurance/great-medic-shield2-great-medic-million-extender2.html" }],
  },
  {
    id: "GELM-GMLS",
    name: "GREAT Medic Lite Secure",
    issuer: GELM,
    basis: "Conventional insurance",
    categories: ["medical"],
    type: "Yearly renewable standalone medical plan for switching from an existing plan",
    status: "Only for existing policyholders of selected eligible medical plans or riders (official page, information correct as on 1 June 2026).",
    howToApply: "Check eligibility with a Great Eastern agent. Switching ends your existing medical plan or rider.",
    verifiedFacts: [
      { label: "Switching (official page)", value: "No waiting period and no medical underwriting; the existing plan is terminated" },
      { label: "Room and board (official page)", value: "Up to RM150 per day" },
      { label: "Deductible (official page)", value: "From RM2,500 per policy year, reset every year" },
    ],
    needsConfirmation: ["Who exactly qualifies", "Limits for each plan option", "Exclusions", "Your premium"],
    evidence: "VERIFIED_OFFICIAL",
    sources: [{ label: "Great Eastern Life — GREAT Medic Lite Secure", url: "https://www.greateasternlife.com/my/en/personal-insurance/our-products/health-insurance/great-medic-lite-secure.html" }],
  },
  {
    id: "GETB-IGMC",
    name: "i-Great Medi Care",
    issuer: GETB,
    basis: "Takaful",
    categories: ["medical"],
    type: "Standalone medical takaful plan with step-up contributions, without savings or investment",
    status: "Shown on the official product page (the page carries no 'information correct as' date).",
    howToApply: "Offered through the official direct online channel, with no intermediary; acceptance depends on underwriting.",
    verifiedFacts: [
      { label: "Cover age (official page)", value: "Up to age 80 next birthday" },
      { label: "Co-takaful (official page)", value: "None for this plan" },
      { label: "Medical examination (official page)", value: "Not required" },
    ],
    needsConfirmation: ["Entry age", "Annual limit and deductible", "Contribution amounts", "Current PDS (not reviewed in this check)", "Waiting periods and exclusions"],
    evidence: "VERIFIED_OFFICIAL",
    sources: [{ label: "Great Eastern Takaful — i-Great Medi Care", url: "https://www.greateasterntakaful.com/en/personal-takaful/our-products/get-it-direct/i-great-medi-care.html" }],
  },
  {
    id: "GELM-SPY",
    name: "SmartProtect You",
    issuer: GELM,
    basis: "Conventional insurance",
    categories: ["life", "tpd"],
    type: "Investment-linked life insurance plan",
    status: "Shown on the official product page (information correct as on 1 August 2026).",
    howToApply: "The official page offers a 'Talk to us' call-back from a Life Planning Advisor; it doesn't describe an online application.",
    verifiedFacts: [
      { label: "Cover (official page)", value: "On death or TPD, the basic and additional sum assured plus the investment value; TPD only before age 75 next birthday" },
      { label: "Entry age (official page)", value: "16 to 70 years next birthday" },
      { label: "Minimum premium (official page)", value: "RM100 a month — not a quote for you" },
    ],
    needsConfirmation: ["Charges, lapse and surrender terms", "Investment risk and fund details", "Rider terms", "Your premium and cover amount"],
    note: "Investment-linked: policy values depend on charges and fund performance and are not guaranteed.",
    evidence: "VERIFIED_OFFICIAL",
    sources: [{ label: "Great Eastern Life — SmartProtect You", url: "https://www.greateasternlife.com/my/en/personal-insurance/our-products/life-insurance/smartprotect-you.html" }],
  },
  {
    id: "GELM-SMCC",
    name: "Smart Multi Critical Care",
    issuer: GELM,
    basis: "Conventional insurance",
    categories: ["critical-illness"],
    type: "Critical illness rider (unit-deduction) attached to selected regular-premium investment-linked plans",
    status: "PDS V03/1123 checked. The product page says its information was correct as at 1 June 2024, so current availability needs confirming.",
    howToApply: "Confirm the current PDS and channel with Great Eastern Life.",
    verifiedFacts: [
      { label: "PDS version checked", value: "V03/1123" },
      { label: "Claims (PDS)", value: "Multiple claims across early, intermediate and advanced stages" },
      { label: "Total benefit (PDS)", value: "Up to 800% of the rider sum assured before age 85 next birthday, capped at RM5,000,000 per life across the company's CI cover" },
      { label: "Early stage (PDS)", value: "50% of the rider sum assured, up to RM300,000 per claim" },
      { label: "Waiting period (PDS)", value: "30 or 60 days, depending on the event" },
      { label: "Survival period (PDS)", value: "7 or 14 days after diagnosis, depending on the event" },
    ],
    needsConfirmation: ["The number of covered conditions (the official page shows both 178 and 188)", "Whether it's currently offered", "Full definitions and exclusions", "Your cost of insurance"],
    evidence: "VERIFIED_OFFICIAL",
    sources: [
      { label: "Great Eastern Life — Smart Multi Critical Care PDS (PDF)", url: "https://www.greateasternlife.com/content/dam/corp-site/my/malaysia/gelm-mcm-marcom/product-/product-disclosure-sheet/gelm-mmc-pd-smcc-pds.pdf" },
      { label: "Great Eastern Life — Smart Multi Critical Care", url: "https://www.greateasternlife.com/my/en/personal-insurance/our-products/health-insurance/smart-multi-critical-care.html" },
    ],
  },
  {
    id: "GEGM-GSA",
    name: "GREAT Shield Active",
    issuer: GEGM,
    basis: "Conventional insurance",
    categories: ["personal-accident"],
    type: "Personal accident insurance",
    status: "PDS information valid as at 31 May 2026; confirm the current version before applying.",
    howToApply: "The PDS describes paying through your agent or intermediary. Confirm the current application route with Great Eastern General.",
    verifiedFacts: [
      { label: "Entry age (PDS)", value: "30 days to 70 years, renewable up to age 100" },
      { label: "Cover term (PDS)", value: "12 months; you renew it every year" },
      { label: "Who can apply (PDS)", value: "Malaysian citizens, permanent residents, or foreigners legally residing in Malaysia; sum-insured limits apply by age and occupation class" },
      { label: "Exclusions (PDS, not the full list)", value: "Include pre-existing conditions, self-inflicted injury, war risks, and illegal or dangerous activities or sports" },
    ],
    needsConfirmation: ["Full policy wording and the complete exclusions list", "Benefits and limits for your occupation class", "Your premium"],
    note: "The PDS includes a sample premium and benefits for occupation classes 1–2. It is an illustration, not a quote, so it isn't shown here.",
    evidence: "VERIFIED_OFFICIAL",
    sources: [{ label: "Great Eastern General — GREAT Shield Active PDS (PDF)", url: "https://www.greateasternlife.com/content/dam/corp-site/my/malaysia/gelm-brand-comm/gegm/gegm-product/gegm-pdt-pd-great-shield-active-pds.pdf" }],
  },
];

export const productsFor = (slug: ProtectionSlug) => researchedProducts.filter((p) => p.categories.includes(slug));

/** Named in research but not officially verified — counted, never shown as products. */
export const UNVERIFIED_PRODUCT_NAME_COUNT = 34;
