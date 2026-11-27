import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, Check, ChevronDown, ExternalLink, Globe, Info, Plus, Scale, UserRound, X } from "lucide-react";
import { Container } from "@/components/layout/Editorial";
import { PageHero } from "@/components/layout/PageHero";
import { GeIcon } from "@/components/illustrations/GeIcons";
import { cn } from "@/lib/cn";
import {
  PRODUCT_RESEARCH_DATE,
  protectionCategories,
  researchedProducts,
  type ProtectionSlug,
  type ResearchedProduct,
} from "@/data/protection";
import { PROTECTION_HASH } from "./ProtectionHub";
import { applicationChannel, splitFactLabel, type Channel } from "./channel";

/**
 * Explore → Compare → Apply (information only). Uses ONLY the products whose facts were verified in
 * official documents (src/data/protection.ts). No prices, rankings, "best" labels, quotes or purchase.
 * The comparison is user-selected and shows each fact with where it came from; a missing fact is shown
 * as "Not in verified sources", never guessed.
 */
const MAX_COMPARE = 3;
const go = (hash: string) => { window.location.hash = hash; };

const channelInfo: Record<Channel, { label: string; icon: typeof Globe; tone: string }> = {
  direct: { label: "Apply online with the insurer", icon: Globe, tone: "bg-teal-50 text-teal-800" },
  adviser: { label: "Through an agent or adviser", icon: UserRound, tone: "bg-navy-50 text-navy-800" },
  check: { label: "Ask the insurer how to apply", icon: Info, tone: "bg-gold-50 text-gold-700" },
  closed: { label: "Not open to new applications", icon: X, tone: "bg-crimson-50 text-crimson-700" },
};

export function ProductExplorer() {
  const [filter, setFilter] = useState<ProtectionSlug | "all">("all");
  const [picked, setPicked] = useState<string[]>([]);
  const products = researchedProducts.filter((p) => p.evidence !== "ISSUER_NOTICE");
  const notices = researchedProducts.filter((p) => p.evidence === "ISSUER_NOTICE");
  const shown = filter === "all" ? products : products.filter((p) => p.categories.includes(filter));
  // Hide the floating "Compare" shortcut once the comparison itself is on screen.
  const [compareVisible, setCompareVisible] = useState(false);
  useEffect(() => {
    const el = document.getElementById("compare");
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setCompareVisible(e.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const compared = picked.map((id) => products.find((p) => p.id === id)!).filter(Boolean);
  const toggle = (id: string) =>
    setPicked((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : cur.length >= MAX_COMPARE ? cur : [...cur, id]));

  return (
    <>
      <PageHero
        eyebrow="How protection works"
        title="Explore products"
        text="Products whose facts we could check in official documents. Pick up to three to compare side by side."
        backLabel="How protection works"
        onBack={() => go(PROTECTION_HASH)}
        titleId="products-title"
      />
      <Container className="max-w-[56rem]">
        <p className="mt-2 flex gap-2 rounded-2xl bg-gold-50 p-3 text-caption text-navy-950 ring-1 ring-gold-100">
          <Info size={16} className="mt-0.5 shrink-0 text-gold-700" aria-hidden />
          <span>
            In no particular order — no rankings, prices or recommendations. Facts checked on {PRODUCT_RESEARCH_DATE}; always confirm the latest
            Product Disclosure Sheet. GREAT EMPOWER is independent and doesn&apos;t sell insurance.
          </span>
        </p>

        <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Filter by kind of cover">
          {[{ slug: "all" as const, label: "All" }, ...protectionCategories.map((c) => ({ slug: c.slug, label: c.purpose }))].map((c) => {
            const count = c.slug === "all" ? products.length : products.filter((p) => p.categories.includes(c.slug)).length;
            if (!count) return null;
            const on = filter === c.slug;
            return (
              <button
                key={c.slug}
                type="button"
                aria-pressed={on}
                onClick={() => setFilter(c.slug)}
                className={cn(
                  "inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 text-body-sm font-semibold",
                  on ? "bg-navy-900 text-white" : "bg-surface text-navy-900 ring-1 ring-ink/[0.1] hover:bg-navy-50",
                )}
              >
                {c.label} <span className={on ? "text-white/70" : "text-ink-muted"}>{count}</span>
              </button>
            );
          })}
        </div>

        <h2 className="sr-only">Products</h2>
        <ul className="mt-4 grid gap-3 md:grid-cols-2" aria-label="Products">
          {shown.map((p) => (
            <li key={p.id}>
              <ProductCard product={p} picked={picked.includes(p.id)} disabled={!picked.includes(p.id) && picked.length >= MAX_COMPARE} onToggle={() => toggle(p.id)} />
            </li>
          ))}
        </ul>
        {notices.map((n) => (
          <p key={n.id} className="mt-3 flex gap-2 rounded-2xl bg-crimson-50/70 p-3 text-caption text-navy-950 ring-1 ring-crimson-100">
            <X size={16} className="mt-0.5 shrink-0 text-crimson-600" aria-hidden />
            <span><b className="font-semibold">{n.name}.</b> {n.status}</span>
          </p>
        ))}

        <section aria-labelledby="compare-title" className="mt-8 scroll-mt-24" id="compare">
          <h2 id="compare-title" className="flex items-center gap-2 font-brand text-[1.875rem] font-semibold text-navy-950">
            <Scale size={24} className="text-teal-700" aria-hidden /> Compare
          </h2>
          <p className="mt-0.5 text-body-sm text-ink-secondary" aria-live="polite">
            {compared.length < 2 ? `Pick ${compared.length ? "one more product" : "two or three products"} above to compare.` : `Comparing ${compared.length} products.`}
          </p>
          {compared.length >= 2 && <CompareTable products={compared} onRemove={toggle} />}
        </section>
        <p className="mt-8 pb-6 text-caption text-ink-muted">
          Information only — not advice, a quote or an offer. Benefits, limits and eligibility are set by each policy&apos;s official documents.
        </p>
      </Container>

      {/* Mobile: jump to the comparison once two are picked. */}
      {picked.length >= 2 && !compareVisible && (
        <div className="fixed inset-x-3 bottom-[calc(max(0.75rem,env(safe-area-inset-bottom))+5.25rem)] z-30 md:hidden">
          <a href="#compare" onClick={(e) => { e.preventDefault(); document.getElementById("compare")?.scrollIntoView({ behavior: "smooth" }); }} className="flex h-12 items-center justify-center gap-2 rounded-full bg-navy-900 text-body-sm font-semibold text-white shadow-e3">
            <Scale size={18} aria-hidden /> Compare {picked.length} products
          </a>
        </div>
      )}
    </>
  );
}

function ProductCard({ product: p, picked, disabled, onToggle }: { product: ResearchedProduct; picked: boolean; disabled: boolean; onToggle: () => void }) {
  const ch = channelInfo[applicationChannel(p)];
  const cats = protectionCategories.filter((c) => p.categories.includes(c.slug));
  return (
    <article className={cn("flex h-full flex-col rounded-2xl bg-surface p-4 ring-1 transition-shadow", picked ? "ring-2 ring-navy-900 shadow-e2" : "ring-ink/[0.08]")} aria-label={p.name}>
      <div className="flex items-start gap-3">
        <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-crimson-50 text-crimson-600">
          <GeIcon name={cats[0]?.iconName ?? "shieldCheck"} size={22} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-body font-semibold leading-snug text-navy-950">{p.name}</h3>
          <p className="mt-0.5 text-caption text-ink-muted">{p.basis === "Takaful" ? "Takaful" : "Insurance"} · {cats.map((c) => c.purpose).join(", ")}</p>
        </div>
      </div>
      <p className="mt-3 text-body-sm text-ink-secondary">{p.type}</p>
      <p className={cn("mt-3 inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-caption font-semibold", ch.tone)}>
        <ch.icon size={14} aria-hidden /> {ch.label}
      </p>
      <details className="group mt-3">
        <summary className="flex min-h-11 cursor-pointer list-none items-center gap-1.5 text-body-sm font-semibold text-navy-900">
          How to apply <ChevronDown size={16} className="transition-transform group-open:rotate-180" aria-hidden />
        </summary>
        <p className="text-body-sm text-ink-secondary">{p.howToApply}</p>
        <a href={p.sources[0]?.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex min-h-11 items-center gap-1.5 text-body-sm font-semibold text-crimson-600">
          Official page <ExternalLink size={14} aria-hidden /><span className="sr-only"> (opens in a new tab)</span>
        </a>
      </details>
      <div className="mt-auto pt-3">
        <button
          type="button"
          aria-pressed={picked}
          disabled={disabled}
          onClick={onToggle}
          className={cn(
            "inline-flex h-11 w-full items-center justify-center gap-2 rounded-full text-body-sm font-semibold",
            picked ? "bg-navy-900 text-white" : "bg-sunken text-navy-900 hover:bg-navy-50",
            disabled && "cursor-not-allowed opacity-50",
          )}
        >
          {picked ? <Check size={16} aria-hidden /> : <Plus size={16} aria-hidden />}
          {picked ? "Added to compare" : disabled ? `Compare up to ${MAX_COMPARE}` : "Add to compare"}
        </button>
      </div>
    </article>
  );
}

function CompareTable({ products, onRemove }: { products: ResearchedProduct[]; onRemove: (id: string) => void }) {
  const rows = useMemo(() => {
    const factRows = new Map<string, Map<string, { value: string; source: string }>>();
    for (const p of products)
      for (const f of p.verifiedFacts) {
        const [label, source] = splitFactLabel(f.label);
        if (!factRows.has(label)) factRows.set(label, new Map());
        factRows.get(label)!.set(p.id, { value: f.value, source });
      }
    return [
      { label: "Kind of cover", cells: products.map((p) => ({ value: protectionCategories.filter((c) => p.categories.includes(c.slug)).map((c) => c.purpose).join(", "), source: "" })) },
      { label: "Insurance or takaful", cells: products.map((p) => ({ value: p.basis, source: "" })) },
      { label: "Product type", cells: products.map((p) => ({ value: p.type, source: "" })) },
      { label: "How to apply", cells: products.map((p) => ({ value: channelInfo[applicationChannel(p)].label, source: "" })) },
      ...[...factRows.entries()].map(([label, byId]) => ({ label, cells: products.map((p) => byId.get(p.id) ?? null) })),
      { label: "Still to confirm", cells: products.map((p) => ({ value: p.needsConfirmation.join(" · "), source: "" })) },
    ];
  }, [products]);

  return (
    <div className="mt-3 overflow-hidden rounded-2xl bg-surface ring-1 ring-ink/[0.08]">
      <div role="table" aria-label="Product comparison" className="grid" style={{ gridTemplateColumns: `minmax(7rem, 0.8fr) repeat(${products.length}, minmax(0, 1fr))` }}>
        <div role="row" className="contents">
          <span role="columnheader" className="border-b border-ink/[0.06] bg-sunken p-3 text-caption font-semibold text-ink-muted">Fact</span>
          {products.map((p) => (
            <span role="columnheader" key={p.id} className="border-b border-ink/[0.06] bg-sunken p-3">
              <span className="block text-body-sm font-semibold leading-snug text-navy-950">{p.name}</span>
              <button type="button" onClick={() => onRemove(p.id)} className="mt-1 inline-flex min-h-11 items-center gap-1 text-caption font-semibold text-crimson-600">
                <X size={13} aria-hidden /> Remove<span className="sr-only"> {p.name}</span>
              </button>
            </span>
          ))}
        </div>
        {rows.map((r) => (
          <div role="row" key={r.label} className="contents">
            <span role="rowheader" className="border-b border-ink/[0.06] p-3 text-caption font-semibold text-navy-950">{r.label}</span>
            {r.cells.map((c, i) => (
              <span role="cell" key={products[i].id} className="border-b border-ink/[0.06] p-3 text-caption text-navy-950 [overflow-wrap:anywhere]">
                {c ? (
                  <>
                    {c.value}
                    {c.source && <span className="mt-1 flex items-center gap-1 text-[12px] text-teal-800"><BadgeCheck size={12} aria-hidden /> {c.source}</span>}
                  </>
                ) : (
                  <span className="text-ink-muted">Not in verified sources</span>
                )}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
