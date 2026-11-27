import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { infographics } from "./learn-media.ts";
import {
  UNVERIFIED_PRODUCT_NAME_COUNT,
  findProtectionCategory,
  productsFor,
  protectionCategories,
  researchedProducts,
} from "./protection.ts";

test("five categories, each with an official category and a different protection purpose", () => {
  assert.deepEqual(protectionCategories.map((c) => c.slug), ["medical", "critical-illness", "life", "tpd", "personal-accident"]);
  assert.deepEqual(protectionCategories.map((c) => c.official), [
    "Medical & Hospitalisation",
    "Critical Illness",
    "Life",
    "Total and Permanent Disability (TPD)",
    "Personal Accident",
  ]);
  for (const c of protectionCategories) {
    assert.ok(c.purpose && c.purpose !== c.official, c.slug);
    assert.ok(c.summary.length > 40 && c.short.length > 10, c.slug);
    assert.ok(c.mayHelp.length >= 2 && c.notAutomatic.length >= 2, `${c.slug}: both what it may and may not cover`);
    assert.ok(c.misunderstandings.length >= 2, c.slug);
    assert.ok(c.notEqual.length >= 1, c.slug);
    assert.match(c.example.title, /illustrative/i, `${c.slug}: examples are labelled illustrative`);
    assert.ok(c.sources.length >= 1, c.slug);
  }
  assert.equal(findProtectionCategory("nope"), undefined);
});

test("the distinctions the brief requires are stated explicitly", () => {
  const pairs = protectionCategories.flatMap((c) => c.notEqual.map((n) => `${n.a} ≠ ${n.b}`));
  assert.ok(pairs.includes("Life insurance ≠ Debt cancellation"));
  assert.ok(pairs.includes("Critical illness cover ≠ Income replacement"));
  assert.ok(pairs.includes("Medical insurance ≠ All medical expenses covered"));
});

test("visuals, scenarios and sources resolve", () => {
  const ids = new Set(infographics.map((i) => i.id));
  const tools = new Set(["tool-bill", "tool-fund", "tool-family", "tool-ci"]);
  for (const c of protectionCategories) {
    if (c.infographicId) assert.ok(ids.has(c.infographicId), c.infographicId);
    if (c.scenario) assert.ok(tools.has(c.scenario.href.replace("app/simulate/needs/", "")), c.scenario.href);
    for (const s of [...c.sources, ...(c.malaysia ?? []).map((m) => m.source)]) assert.match(s.url, /^https:\/\//, s.label);
  }
  // Malaysia-specific facts always carry a source.
  for (const c of protectionCategories) for (const m of c.malaysia ?? []) assert.ok(m.source.url, m.text);
});

const EXPECTED_PRODUCTS: Record<string, string> = {
  // id → official name, exactly as in the audited Product Master (VERIFIED_OFFICIAL records + the issuer notice).
  "GEGM-IND-MED-PORTFOLIO": "Individual medical products (GEGM) — notice",
  "GELM-SHP": "SMART Health Protector",
  "GELM-GMV": "GREAT MediValue",
  "GELM-GMS2": "GREAT Medic Shield 2",
  "GELM-GMLS": "GREAT Medic Lite Secure",
  "GETB-IGMC": "i-Great Medi Care",
  "GELM-SPY": "SmartProtect You",
  "GELM-SMCC": "Smart Multi Critical Care",
  "GEGM-GSA": "GREAT Shield Active",
};

test("only officially verified products (and one issuer notice) are listed — 8 products, 34 unverified names withheld", () => {
  assert.deepEqual(Object.fromEntries(researchedProducts.map((p) => [p.id, p.name])), EXPECTED_PRODUCTS);
  assert.equal(researchedProducts.filter((p) => p.evidence === "VERIFIED_OFFICIAL").length, 8);
  assert.equal(researchedProducts.filter((p) => p.evidence === "ISSUER_NOTICE").length, 1);
  assert.equal(8 + UNVERIFIED_PRODUCT_NAME_COUNT, 42, "Product Master counts 42 named candidates");
});

test("products: official sources only, entity and takaful kept distinct, gaps always disclosed", () => {
  for (const p of researchedProducts) {
    assert.ok(p.sources.length >= 1, p.id);
    for (const s of p.sources) assert.match(s.url, /^https:\/\/www\.greateastern(life|takaful)\.com\//, `${p.id}: ${s.url}`);
    assert.ok(p.needsConfirmation.length >= 1, `${p.id} lists what still needs confirmation`);
    assert.ok(p.howToApply && p.status && p.type, p.id);
    if (p.id.startsWith("GETB-")) assert.equal(p.basis, "Takaful", p.id);
    else assert.equal(p.basis, "Conventional insurance", p.id);
    assert.equal(p.issuer.includes("Takaful"), p.id.startsWith("GETB-"), p.id);
  }
  // Every category with an official product page appears where it belongs.
  assert.deepEqual(productsFor("critical-illness").map((p) => p.id), ["GELM-SMCC"]);
  assert.deepEqual(productsFor("personal-accident").map((p) => p.id), ["GEGM-GSA"]);
  assert.deepEqual(productsFor("tpd").map((p) => p.id), ["GELM-SPY"]);
});

test("no prices, quotes, rankings or purchase language in product data", () => {
  const text = JSON.stringify(researchedProducts);
  assert.ok(!/\b(best|cheapest|recommended for you|buy now|top pick)\b/i.test(text));
  // The only money amount that is a price is the official minimum premium, labelled as not a quote.
  const priceFacts = researchedProducts.flatMap((p) => p.verifiedFacts).filter((f) => /premium|contribution/i.test(f.label));
  assert.deepEqual(priceFacts.map((f) => f.value), ["RM100 a month — not a quote for you"]);
  // The GREAT Shield Active PDS sample premium (an illustration) is deliberately not shown.
  assert.ok(!text.includes("236.19"));
});

test("no checkout or purchase flow exists in the protection feature", () => {
  for (const f of ["../app/protection/ProtectionHub.tsx", "../app/protection/ProtectionScenarios.tsx", "../app/protection/ProductExplorer.tsx", "../app/protection/TermExplainer.tsx"]) {
    const src = readFileSync(new URL(f, import.meta.url), "utf8");
    assert.ok(!/checkout|add to cart|purchase now|apply now|get a quote/i.test(src), f);
  }
});

test("visual assets: one icon per 'may help' item, and each category has a credited local hero photo", () => {
  for (const c of protectionCategories) {
    assert.equal(c.mayHelpIcons.length, c.mayHelp.length, c.slug);
    assert.ok(c.iconName, c.slug);
    assert.match(c.photo.src, /^\/images\/pexels\/[a-z0-9-]+\.webp$/, c.slug);
    const file = new URL(`../../public${c.photo.src}`, import.meta.url);
    assert.ok(readFileSync(file).length > 10_000, `${c.photo.src} exists and isn't empty`);
    assert.match(c.photo.credit.url, /^https:\/\/www\.pexels\.com\/photo\//, c.slug);
    assert.ok(c.photo.credit.photographer, c.slug);
  }
  assert.equal(new Set(protectionCategories.map((c) => c.photo.src)).size, 5, "no photo reused across categories");
});

test("cover cards: every item has a short title (same order and count)", () => {
  for (const c of protectionCategories) {
    assert.equal(c.mayHelpTitles.length, c.mayHelp.length, c.slug);
    assert.equal(c.notAutomaticTitles.length, c.notAutomatic.length, c.slug);
    for (const t of [...c.mayHelpTitles, ...c.notAutomaticTitles]) assert.ok(t.length > 0 && t.length <= 32, `${c.slug}: "${t}" is short`);
  }
});

test("product explorer: channels are read from official wording; fact labels split into name + source", async () => {
  const { applicationChannel, splitFactLabel } = await import("../app/protection/channel.ts");
  const byId = Object.fromEntries(researchedProducts.map((p) => [p.id, applicationChannel(p)]));
  assert.equal(byId["GETB-IGMC"], "direct");
  assert.equal(byId["GELM-SPY"], "adviser");
  assert.equal(byId["GEGM-IND-MED-PORTFOLIO"], "closed");
  assert.deepEqual(splitFactLabel("Annual limit (PDS and official page)"), ["Annual limit", "PDS and official page"]);
  assert.deepEqual(splitFactLabel("Cover"), ["Cover", ""]);
});
