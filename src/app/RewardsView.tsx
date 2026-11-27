import { useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  HeartPulse,
  UtensilsCrossed,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Coins,

  History,
  Image as ImageIcon,
  Loader2,
  ShieldCheck,
  Sparkles,
  Store,
  Ticket,
  Wallet,
  XCircle,
} from "lucide-react";
import { Container } from "@/components/layout/Editorial";
import { PageHero } from "@/components/layout/PageHero";
import { cn } from "@/lib/cn";
import { PassSpot, VoucherSpot } from "@/components/illustrations/Spots";
import {
  WELCOME_PRICE,
  activeBrands,
  activeProducts,
  challenges,
  findBrand,
  findProduct,
  isWelcomeEligible,
  type BrandId,
  type Product,
} from "@/rewards/catalogue";
import { challengeProgress, heldVouchers, quote, welcomeAvailableFor } from "@/rewards/economy";
import { rewardsActions, useRewards } from "@/rewards/store";
import { PassView } from "./rewards/PassView";

const go = (hash: string) => {
  window.location.hash = hash;
  window.scrollTo({ top: 0 });
};
const pts = (n: number) => `${n.toLocaleString("en-MY")} pts`;

const SIMULATED_NOTE =
  "Points, Marketplace brands and items are fictional and have no cash value; the brands are not real merchants. GREAT EMPOWER Vouchers are collectible rewards: GREAT EMPOWER doesn't sell insurance, so vouchers can't be used to pay for insurance and have no cash value.";

/** Shown instead of the catalogue's voucher description, which predates the education-only decision. */
const voucherDescription = "A collectible GREAT EMPOWER reward for your learning. It has no cash value and can't be used to pay for insurance.";
/**
 * Voucher terms as shown in the app. The catalogue's VOUCHER_TERMS still describe a future insurance
 * purchase; GREAT EMPOWER is education-only, so the UI states what a voucher actually is today.
 */
const voucherTermsShown = [
  "A collectible reward for your learning. GREAT EMPOWER doesn't sell insurance, so this voucher can't be used to pay for insurance.",
  "No cash value and not transferable. It isn't an insurance policy, an offer from any insurer, or a promise of cover.",
  "You can hold one of each voucher at a time.",
];

const foodAndDrink = activeProducts.filter(isWelcomeEligible);
const vouchers = activeProducts.filter((p) => p.voucher);

export function RewardsView({ route }: { route: string }) {
  const parts = route.split("/"); // app/rewards/<view>/<id>
  const view = parts[2];
  if (view === "marketplace") return <Marketplace brandId={parts[3] as BrandId | undefined} />;
  if (view === "product" && parts[3] && findProduct(parts[3]) && !findProduct(parts[3])!.retired) return <ProductDetail id={parts[3]} />;
  if (view === "wallet") return <WalletView />;
  if (view === "pass" && parts[3]) return <PassView id={parts[3]} />;
  return <RewardsHub />;
}

/* ------------------------------------------------------------------------------------------ */

function RewardsHub() {
  const state = useRewards();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const ready = state.passes.filter((p) => p.status === "ready").length;
  // Display-only helpers (no rewards logic): what the balance covers today, and the next voucher to aim for.
  const affordable = activeProducts.filter((p) => p.price <= state.points).length;
  const nextVoucher = [...vouchers].sort((a, b) => a.price - b.price).find((v) => v.price > state.points);
  // Challenges ready to claim first.
  const orderedChallenges = [...challenges].sort((a, b) => Number(challengeProgress(state, b.id).complete && !challengeProgress(state, b.id).claimed) - Number(challengeProgress(state, a.id).complete && !challengeProgress(state, a.id).claimed));

  return (
    <>
      <PageHero
        eyebrow="Rewards Hub"
        title="Points for progress."
        text="Learn, plan and take action to earn points, then redeem healthy food, drinks and more."
        image="/images/lifetrack/marketplace/products/greenbowl/veggie-bowl-640.webp"
        backLabel="Rewards Hub"
        onBack={() => go("app/home")}
        titleId="rewards-title"
      />

      <Container className="relative -mt-5">
        <div className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-navy-900 via-navy-950 to-navy-950 p-5 text-white shadow-e3 sm:p-6">
          <span className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-gold-500/15" aria-hidden />
          <span className="pointer-events-none absolute -bottom-24 right-10 size-48 rounded-full bg-crimson-600/20" aria-hidden />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="flex items-center gap-1.5 text-caption font-semibold text-gold-300"><Coins size={15} aria-hidden /> Your points</p>
              <p className="mt-1 font-brand text-[2.75rem] font-bold leading-none tabular-nums">
                {state.points.toLocaleString("en-MY")} <span className="text-body font-semibold text-white/70">pts</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => go("app/rewards/wallet")}
              className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-white px-4 text-body-sm font-semibold text-navy-950 hover:bg-navy-50"
            >
              <Wallet size={16} aria-hidden /> Wallet
              {ready > 0 && <span className="ml-0.5 rounded-full bg-crimson-600 px-1.5 text-[12px] font-bold text-white">{ready}</span>}
            </button>
          </div>
          <div className="relative mt-5 grid gap-3 border-t border-white/10 pt-4 sm:grid-cols-2">
            <p className="text-body-sm text-white/85">
              <b className="font-semibold text-white">{affordable}</b> {affordable === 1 ? "item" : "items"} you can redeem now
            </p>
            {nextVoucher ? (
              <div>
                <p className="text-body-sm text-white/85">
                  <b className="font-semibold text-white">{(nextVoucher.price - state.points).toLocaleString("en-MY")} pts</b> to {nextVoucher.name}
                </p>
                <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-white/15" aria-hidden>
                  <span className="block h-full rounded-full bg-gold-300" style={{ width: `${Math.min(100, (state.points / nextVoucher.price) * 100)}%` }} />
                </span>
              </div>
            ) : (
              <p className="text-body-sm text-white/85">You can redeem every voucher.</p>
            )}
          </div>
        </div>
      </Container>

      {/* Browse by kind */}
      <Container className="mt-4">
        <ul className="grid grid-cols-3 gap-2">
          {[
            { label: "Food & drinks", icon: UtensilsCrossed, to: "app/rewards/marketplace", tone: "bg-crimson-50 text-crimson-600" },
            { label: "Wellness", icon: HeartPulse, to: "app/rewards/marketplace/careplus", tone: "bg-teal-50 text-teal-700" },
            { label: "Vouchers", icon: Ticket, to: "app/rewards/marketplace/great-empower", tone: "bg-gold-50 text-gold-700" },
          ].map((c) => (
            <li key={c.label}>
              <button type="button" onClick={() => go(c.to)} className="flex min-h-[4.5rem] w-full flex-col items-center justify-center gap-1.5 rounded-2xl bg-surface p-2 text-center ring-1 ring-ink/[0.07] hover:shadow-e1">
                <span className={cn("inline-flex size-9 items-center justify-center rounded-xl", c.tone)}><c.icon size={18} aria-hidden /></span>
                <span className="text-caption font-semibold text-navy-950">{c.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </Container>

      {message && (
        <Container className="mt-4">
          <p role="status" className={cn("flex items-center gap-2 rounded-xl px-4 py-3 text-body-sm font-semibold", message.ok ? "bg-success-50 text-success-700" : "bg-error-50 text-error-700")}>
            {message.ok ? <CheckCircle2 size={18} aria-hidden /> : <XCircle size={18} aria-hidden />}
            {message.text}
          </p>
        </Container>
      )}

      {/* One-time welcome offer */}
      {!state.welcomeRedeemed && (
        <Container className="mt-5">
          <div className="relative overflow-hidden rounded-[1.25rem] bg-gradient-to-br from-crimson-600 to-crimson-800 p-4 text-white shadow-e2 sm:p-5">
            <Sparkles size={64} className="absolute -right-2 -top-2 text-white/10" aria-hidden />
            <p className="text-overline uppercase tracking-[0.2em] text-white/80">Welcome offer · one time</p>
            <p className="mt-1 font-brand text-[1.625rem] font-semibold leading-tight">
              Any food or drink for {WELCOME_PRICE} pts
            </p>
            <p className="mt-1 text-body-sm text-white/85">
              Pick one item below and choose the welcome price at checkout. Regular prices start at 1,000 pts.
            </p>
          </div>
        </Container>
      )}

      {/* Food & drink, redeemable directly */}
      <Container className="mt-6">
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-heading text-navy-950">Redeem food &amp; drinks</h2>
          <button type="button" onClick={() => go("app/rewards/marketplace")} className="inline-flex min-h-11 items-center gap-1 text-body-sm font-semibold text-navy-900">
            All {foodAndDrink.length} items <ArrowRight size={15} aria-hidden />
          </button>
        </div>
        {/* A taste of the catalogue; the full list is one tap away. */}
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {foodAndDrink.slice(0, 4).map((p) => (
            <li key={p.id}>
              <ProductCard product={p} welcome={welcomeAvailableFor(state, p.id)} />
            </li>
          ))}
        </ul>
      </Container>

      {/* Challenges */}
      <Container className="mt-8">
        <h2 className="text-heading text-navy-950">Earn more points</h2>
        <ul className="mt-3 grid gap-2.5">
          {orderedChallenges.map((c) => {
            const p = challengeProgress(state, c.id);
            return (
              <li key={c.id} className="flex items-center gap-3 rounded-2xl bg-surface p-3.5 ring-1 ring-ink/[0.07]">
                <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-crimson-50 text-crimson-600">
                  {c.id === "visual-learner" ? <ImageIcon size={20} aria-hidden /> : c.id === "know-your-coverage" ? <ShieldCheck size={20} aria-hidden /> : <BookOpen size={20} aria-hidden />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-body font-semibold text-navy-950">{c.title}</p>
                  <p className="text-caption text-ink-muted">{c.detail}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-sunken">
                      <span className="block h-full rounded-full bg-crimson-600" style={{ width: `${(p.done / p.target) * 100}%` }} />
                    </span>
                    <span className="text-caption font-semibold tabular-nums text-navy-900">{p.done}/{p.target}</span>
                  </div>
                </div>
                {p.claimed ? (
                  <span className="inline-flex h-9 items-center gap-1 rounded-full bg-success-50 px-3 text-caption font-bold text-success-700">
                    <CheckCircle2 size={14} aria-hidden /> Claimed
                  </span>
                ) : p.complete ? (
                  <button
                    type="button"
                    onClick={async () => {
                      const r = await rewardsActions.claimChallenge(c.id);
                      setMessage(r.ok ? { ok: true, text: `+${c.bonus} pts added.` } : { ok: false, text: r.error });
                    }}
                    className="inline-flex h-11 items-center rounded-full bg-crimson-600 px-4 text-caption font-bold text-white hover:bg-crimson-700"
                  >
                    Claim +{c.bonus}
                  </button>
                ) : (
                  <span className="inline-flex h-9 items-center rounded-full bg-gold-50 px-3 text-caption font-bold text-gold-700">+{c.bonus} pts</span>
                )}
              </li>
            );
          })}
        </ul>
        <p className="mt-2 text-caption text-ink-muted">Perfect quiz scores, full video watches and a finished profile earn points. Each activity pays once.</p>
      </Container>

      {/* GREAT EMPOWER Vouchers */}
      <Container className="mt-8">
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-heading text-navy-950">GREAT EMPOWER Vouchers</h2>
          <button type="button" onClick={() => go("app/rewards/marketplace/great-empower")} className="inline-flex min-h-11 shrink-0 items-center gap-1 whitespace-nowrap text-body-sm font-semibold text-navy-900">
            View all <ArrowRight size={15} aria-hidden />
          </button>
        </div>
        <p className="mt-1 text-body-sm text-ink-secondary">
          Collectible rewards for your learning, kept in your wallet. GREAT EMPOWER doesn't sell insurance, so vouchers can't be used to pay for insurance and have no cash value.
        </p>
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {vouchers.map((p) => (
            <li key={p.id}>
              <ProductCard product={p} welcome={false} />
            </li>
          ))}
        </ul>
      </Container>

      {/* Marketplace entry */}
      <Container className="mt-6">
        <button type="button" onClick={() => go("app/rewards/marketplace")} className="group relative w-full overflow-hidden rounded-[1.5rem] bg-navy-950 p-5 text-left text-white">
          <span className="text-overline uppercase tracking-[0.2em] text-teal-200">GREAT EMPOWER</span>
          <span className="mt-1 flex items-center gap-2 font-brand text-[1.75rem] font-semibold">
            <Store size={22} aria-hidden /> Marketplace
          </span>
          <span className="mt-1 block max-w-[20rem] text-body-sm text-white/75">
            Healthy food and drinks, wellness essentials and GREAT EMPOWER Vouchers.
          </span>
          <span className="mt-4 flex -space-x-2">
            {activeBrands.filter((b) => b.logo).map((b) => (
              <img key={b.id} src={b.logo} alt="" className="size-10 rounded-full bg-white object-contain p-0.5 ring-2 ring-navy-950" />
            ))}
          </span>
          <ChevronRight size={22} className="absolute right-5 top-1/2 -translate-y-1/2 transition-transform group-hover:translate-x-1" aria-hidden />
        </button>
        <p className="mt-3 text-caption text-ink-muted">{SIMULATED_NOTE}</p>
      </Container>
    </>
  );
}

/* ------------------------------------------------------------------------------------------ */

function Marketplace({ brandId }: { brandId?: BrandId }) {
  const state = useRewards();
  const active = brandId && findBrand(brandId) && !findBrand(brandId)!.retired ? brandId : null;
  const list = active ? activeProducts.filter((p) => p.brand === active) : activeProducts;
  return (
    <>
      <PageHero eyebrow="GREAT EMPOWER" title="Marketplace" text="Redeem healthy choices, wellness essentials and GREAT EMPOWER Vouchers." backLabel="Marketplace" onBack={() => go("app/rewards")} titleId="market-title">
        <p className="mt-4 inline-flex h-9 items-center gap-2 rounded-full bg-white/10 px-3.5 text-body-sm font-semibold">
          <Coins size={16} className="text-gold-300" aria-hidden /> {pts(state.points)} available
        </p>
      </PageHero>
      <Container className="mt-5">
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 scrollbar-none" role="tablist" aria-label="Brands">
          <BrandChip label="All" selected={!active} onClick={() => go("app/rewards/marketplace")} />
          {activeBrands.map((b) => (
            <BrandChip key={b.id} label={b.name} logo={b.logo} selected={active === b.id} onClick={() => go(`app/rewards/marketplace/${b.id}`)} />
          ))}
        </div>
        {active && <p className="mt-3 text-body-sm text-ink-muted">{findBrand(active)?.tagline}</p>}
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {list.map((p) => (
            <li key={p.id}>
              <ProductCard product={p} welcome={welcomeAvailableFor(state, p.id)} />
            </li>
          ))}
        </ul>
        <p className="mt-4 text-caption text-ink-muted">{SIMULATED_NOTE}</p>
      </Container>
    </>
  );
}

function BrandChip({ label, logo, selected, onClick }: { label: string; logo?: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onClick}
      className={cn(
        "inline-flex h-11 shrink-0 items-center gap-2 rounded-full pl-1.5 pr-4 text-caption font-bold tracking-[0.06em] transition-colors",
        !logo && "pl-4",
        selected ? "bg-navy-900 text-white" : "bg-surface text-navy-900 ring-1 ring-ink/10 hover:bg-navy-50",
      )}
    >
      {logo && <img src={logo} alt="" className="size-8 rounded-full bg-white object-contain" />}
      {label}
    </button>
  );
}

function VoucherVisual({ product, className }: { product: Product; className?: string }) {
  const v = product.voucher!;
  return (
    <span className={cn("relative flex aspect-square w-full flex-col justify-between overflow-hidden bg-gradient-to-br from-navy-950 via-navy-800 to-crimson-700 p-4 text-white", className)}>
      <span aria-hidden className="absolute -right-8 -top-8 size-28 rounded-full bg-white/10" />
      <span aria-hidden className="absolute -bottom-10 -left-6 size-24 rounded-full bg-crimson-500/25" />
      <span className="relative text-[12px] font-bold uppercase tracking-[0.18em] text-teal-200">GREAT EMPOWER</span>
      <span className="relative">
        <span className="block font-brand text-[2.5rem] font-bold leading-none">{v.face}</span>
        <span className="mt-1 block text-[12px] font-semibold text-white/80">{v.discount.type === "percent" ? `voucher · up to RM${v.discount.capRm}` : "voucher"}</span>
      </span>
      <span className="relative flex items-center gap-1.5 border-t border-dashed border-white/30 pt-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-white/75">
        <Ticket size={12} aria-hidden /> Collectible voucher
      </span>
    </span>
  );
}

function ProductVisual({ product, className }: { product: Product; className?: string }) {
  const brand = findBrand(product.brand)!;
  if (product.voucher) return <VoucherVisual product={product} className={className} />;
  return product.image ? (
    <img src={product.image} alt="" loading="lazy" className={cn("ge-skeleton aspect-square w-full object-cover", className)} />
  ) : (
    <span className={cn("flex aspect-square w-full items-center justify-center bg-gradient-to-br from-navy-900 to-navy-700", className)}>
      <img src={brand.logo} alt="" className="w-1/2 rounded-2xl bg-white object-contain p-2" />
    </span>
  );
}

function ProductCard({ product, welcome }: { product: Product; welcome: boolean }) {
  const brand = findBrand(product.brand)!;
  return (
    <button
      type="button"
      onClick={() => go(`app/rewards/product/${product.id}`)}
      className="group relative flex h-full w-full flex-col overflow-hidden rounded-2xl bg-surface text-left ring-1 ring-ink/[0.07] transition-shadow hover:shadow-e2"
    >
      <ProductVisual product={product} />
      <span className="flex flex-1 flex-col p-3">
        <span className="text-[12px] font-bold uppercase tracking-[0.1em] text-ink-muted">{brand.name}</span>
        <span className="mt-0.5 line-clamp-2 text-body-sm font-semibold text-navy-950">{product.name}</span>
        {welcome ? (
          <span className="mt-auto flex flex-wrap items-baseline gap-x-1.5 pt-2">
            <span className="text-body-sm font-bold text-crimson-600">{pts(WELCOME_PRICE)}</span>
            <s className="text-caption text-ink-muted">{pts(product.price)}</s>
            <span className="w-full text-caption font-semibold text-crimson-700">Welcome price</span>
          </span>
        ) : (
          <span className="mt-auto pt-2 text-body-sm font-bold text-crimson-600">{pts(product.price)}</span>
        )}
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------------------------------ */

type Checkout = { phase: "idle" } | { phase: "confirm" } | { phase: "processing" } | { phase: "done"; total: number } | { phase: "error"; message: string };

function ProductDetail({ id }: { id: string }) {
  const state = useRewards();
  const product = findProduct(id)!;
  const brand = findBrand(product.brand)!;
  const canWelcome = welcomeAvailableFor(state, id);
  const [useWelcome, setUseWelcome] = useState(canWelcome);
  const [checkout, setCheckout] = useState<Checkout>({ phase: "idle" });
  const [requestId] = useState(() => rewardsActions.newRequestId("redeem"));
  const busy = useRef(false);
  const q = quote(state, id, useWelcome)!;
  const held = product.voucher ? heldVouchers(state, id) >= product.voucher.maxHeld : false;

  const confirm = async () => {
    // Ref guard: a double tap within one render can't send a second request.
    if (busy.current) return;
    busy.current = true;
    setCheckout({ phase: "processing" });
    const r = await rewardsActions.redeem(id, q.welcome, requestId);
    busy.current = false;
    if (!r.ok) {
      setCheckout({ phase: "error", message: r.error });
      return;
    }
    const pass = r.state.passes.find((p) => p.transactionId === r.transaction.id);
    if (pass) go(`app/rewards/pass/${pass.id}`);
    else setCheckout({ phase: "done", total: -r.transaction.points });
  };

  if (checkout.phase === "done") {
    return (
      <Container className="flex min-h-[60vh] max-w-[30rem] flex-col items-center justify-center py-10 text-center">
        <span className="inline-flex size-16 items-center justify-center rounded-full bg-success-50 text-success-600">
          <CheckCircle2 size={34} aria-hidden />
        </span>
        <h1 className="mt-4 font-brand text-[2rem] font-semibold text-navy-950">Redeemed</h1>
        <p className="mt-1 text-body text-ink-secondary">{product.name}</p>
        <dl className="mt-4 grid w-full grid-cols-2 gap-2 text-left">
          <div className="rounded-xl bg-crimson-50 p-3">
            <dt className="text-caption text-ink-secondary">Points used</dt>
            <dd className="font-brand text-[1.5rem] font-semibold tabular-nums text-crimson-700">−{pts(checkout.total)}</dd>
          </div>
          <div className="rounded-xl bg-teal-50 p-3">
            <dt className="text-caption text-ink-secondary">Balance now</dt>
            <dd className="font-brand text-[1.5rem] font-semibold tabular-nums text-teal-800">{pts(state.points)}</dd>
          </div>
        </dl>
        {product.voucher && (
          <p className="mt-3 rounded-xl bg-navy-50 px-4 py-3 text-body-sm text-navy-900">
            Saved in your wallet as a collectible reward. GREAT EMPOWER doesn&apos;t sell insurance, so vouchers can&apos;t be used to pay for insurance and have no cash value.
          </p>
        )}
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={() => go("app/rewards/wallet")} className="inline-flex h-12 items-center rounded-full bg-navy-900 px-5 text-body-sm font-semibold text-white">
            View wallet
          </button>
          <button type="button" onClick={() => go("app/rewards")} className="inline-flex h-12 items-center rounded-full px-5 text-body-sm font-semibold text-navy-900 ring-1 ring-ink/15">
            Keep browsing
          </button>
        </div>
      </Container>
    );
  }

  return (
    <div className="pb-6">
      <div className="relative">
        <ProductVisual product={product} className={cn("max-h-[22rem] md:max-h-[26rem]", product.voucher && "pt-20")} />
        <button type="button" onClick={() => go("app/rewards")} aria-label="Back to Rewards" className="absolute left-4 top-4 inline-flex size-11 items-center justify-center rounded-full bg-white/90 text-navy-950 shadow-e2 backdrop-blur">
          <ArrowLeft size={20} aria-hidden />
        </button>
      </div>
      <Container className="max-w-[40rem] pt-5">
        <div className="flex items-center gap-2">
          {brand.logo && <img src={brand.logo} alt="" className="size-8 rounded-full bg-white object-contain ring-1 ring-ink/10" />}
          <span className="text-caption font-bold uppercase tracking-[0.1em] text-ink-muted">{brand.name}</span>
        </div>
        <h1 className="mt-2 font-brand text-[2rem] font-semibold leading-tight text-navy-950">{product.name}</h1>
        <p className="mt-1 text-body text-ink-secondary">{product.voucher ? voucherDescription : product.description}</p>

        {/* Can I redeem it now? (display only — the quote comes from the rewards economy) */}
        <div className="mt-4 rounded-2xl bg-surface p-4 ring-1 ring-ink/[0.08]">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-body-sm font-semibold text-navy-950">{held ? "Already in your wallet" : q.affordable ? "You can redeem this now" : `${pts(q.total - state.points)} to go`}</span>
            <span className="text-caption text-ink-muted tabular-nums">{pts(state.points)} of {pts(q.total)}</span>
          </div>
          <span className="mt-2 block h-2 overflow-hidden rounded-full bg-sunken" aria-hidden>
            <span className={cn("block h-full rounded-full", q.affordable ? "bg-teal-600" : "bg-gold-500")} style={{ width: `${Math.min(100, (state.points / Math.max(1, q.total)) * 100)}%` }} />
          </span>
          <ol className="mt-4 grid grid-cols-3 gap-2 text-center">
            {(product.voucher
              ? ["Redeem with points", "Saved in your Wallet", "A collectible: no cash value"]
              : ["Redeem with points", "A pass appears in your Wallet", "Show the pass when you collect"]
            ).map((t, i) => (
              <li key={t} className="flex flex-col items-center gap-1.5">
                <span className="inline-flex size-7 items-center justify-center rounded-full bg-navy-900 text-caption font-bold text-white">{i + 1}</span>
                <span className="text-caption text-ink-secondary">{t}</span>
              </li>
            ))}
          </ol>
        </div>
        {product.voucher && (
          <div className="mt-4 rounded-2xl bg-navy-50 p-4 text-body-sm text-navy-900">
            <p className="font-semibold">Voucher terms</p>
            <ul className="mt-2 grid list-disc gap-1.5 pl-5">
              {voucherTermsShown.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        )}

        {isWelcomeEligible(product) && (
          <fieldset className="mt-6">
            <legend className="text-subheading text-navy-950">Price</legend>
            <div className="mt-2 grid gap-2" role="radiogroup">
              <PriceOption
                label="Regular price"
                detail={pts(product.price)}
                selected={!useWelcome || !canWelcome}
                onSelect={() => setUseWelcome(false)}
              />
              <PriceOption
                label={`Welcome offer · ${pts(WELCOME_PRICE)}`}
                detail={canWelcome ? "One-time new-player price for any food or drink item" : "Already used"}
                selected={useWelcome && canWelcome}
                disabled={!canWelcome}
                onSelect={() => setUseWelcome(true)}
              />
            </div>
          </fieldset>
        )}
        {held && (
          <p className="mt-4 rounded-xl bg-gold-50 px-4 py-3 text-body-sm text-gold-700">
            You already hold this voucher. You can hold one of each voucher at a time.
          </p>
        )}
        {!isWelcomeEligible(product) && !state.welcomeRedeemed && (
          <p className="mt-4 rounded-xl bg-gold-50 px-4 py-3 text-body-sm text-gold-700">
            The Welcome Offer applies to food and drink items only, so this {product.voucher ? "voucher" : "item"} uses its
            regular price. Your Welcome Offer stays available.
          </p>
        )}

        <dl className="mt-6 grid gap-2 rounded-2xl bg-surface p-4 text-body-sm ring-1 ring-ink/[0.07]">
          <div className="flex justify-between"><dt className="text-ink-secondary">Regular price</dt><dd className={cn("font-semibold tabular-nums", q.welcome && "text-ink-muted line-through")}>{pts(q.price)}</dd></div>
          {q.welcome && <div className="flex justify-between"><dt className="text-ink-secondary">Welcome offer</dt><dd className="font-semibold tabular-nums text-success-700">{pts(WELCOME_PRICE)}</dd></div>}
          <div className="flex justify-between border-t border-ink/10 pt-2 text-body"><dt className="font-semibold text-navy-950">You pay</dt><dd className="font-bold tabular-nums text-navy-950">{pts(q.total)}</dd></div>
          <div className="flex justify-between text-caption"><dt className="text-ink-muted">Your balance after</dt><dd className={cn("tabular-nums", q.affordable ? "text-ink-muted" : "font-semibold text-error-700")}>{pts(state.points - q.total)}</dd></div>
        </dl>

        {checkout.phase === "error" && (
          <p role="alert" className="mt-3 flex items-center gap-2 rounded-xl bg-error-50 px-4 py-3 text-body-sm font-semibold text-error-700">
            <XCircle size={18} aria-hidden /> {checkout.message} Nothing was deducted.
          </p>
        )}

        {checkout.phase === "confirm" || checkout.phase === "processing" ? (
          <div className="mt-4 rounded-2xl bg-navy-950 p-4 text-white">
            <p className="text-body font-semibold">Confirm redemption?</p>
            <p className="mt-0.5 text-body-sm text-white/75">
              {pts(q.total)} will be deducted{q.welcome ? " and your one-time welcome offer will be used" : ""}.
            </p>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={confirm} disabled={checkout.phase === "processing"} className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-crimson-600 text-body-sm font-bold text-white hover:bg-crimson-700 disabled:opacity-70">
                {checkout.phase === "processing" && <Loader2 size={18} className="animate-spin" aria-hidden />} Confirm
              </button>
              <button type="button" onClick={() => setCheckout({ phase: "idle" })} className="inline-flex h-12 items-center rounded-full px-5 text-body-sm font-semibold text-white ring-1 ring-white/30">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            disabled={!q.affordable || held}
            onClick={() => setCheckout({ phase: "confirm" })}
            className="mt-4 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-crimson-600 text-body font-bold text-white hover:bg-crimson-700 disabled:bg-ink/20 disabled:text-ink-muted"
          >
            {held ? "Already in your wallet" : q.affordable ? <>Redeem for {pts(q.total)} <ArrowRight size={18} aria-hidden /></> : `Not enough points (${pts(q.total - state.points)} short)`}
          </button>
        )}
        <p className="mt-3 text-caption text-ink-muted">{SIMULATED_NOTE}</p>
      </Container>
    </div>
  );
}

function PriceOption({ label, detail, selected, disabled, onSelect }: { label: string; detail: string; selected: boolean; disabled?: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "flex min-h-14 w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left ring-1 transition-colors",
        selected ? "bg-navy-50 ring-navy-900" : "bg-surface ring-ink/10 hover:ring-ink/25",
        disabled && "cursor-not-allowed opacity-55",
      )}
    >
      <span className={cn("size-4 shrink-0 rounded-full ring-2", selected ? "bg-navy-900 ring-navy-900 ring-offset-2" : "ring-ink/25")} aria-hidden />
      <span className="min-w-0">
        <span className="block text-body-sm font-semibold text-navy-950">{label}</span>
        <span className="block text-caption text-ink-muted">{detail}</span>
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------------------------------ */

function WalletView() {
  const state = useRewards();
  const [tab, setTab] = useState<"ready" | "used">("ready");
  const list = state.passes.filter((p) => p.status === tab);

  return (
    <>
      <PageHero eyebrow="Rewards" title="Wallet" text="Your points, redemption passes, vouchers and history." backLabel="Wallet" onBack={() => go("app/rewards")} titleId="wallet-title">
        <p className="mt-4 font-brand text-[2.5rem] font-bold leading-none tabular-nums">
          {state.points.toLocaleString("en-MY")} <span className="text-body font-semibold text-white/70">pts</span>
        </p>
      </PageHero>

      <Container className="mt-5">
        <h2 className="text-heading text-navy-950">Redemption passes</h2>
        <div className="mt-3 grid grid-cols-2 rounded-full bg-sunken p-1" role="tablist" aria-label="Pass status">
          {(["ready", "used"] as const).map((k) => (
            <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn("h-11 rounded-full text-caption font-bold", tab === k ? "bg-surface text-navy-950 shadow-e1" : "text-ink-muted")}>
              {k === "ready" ? "Ready to use" : "Used"} ({state.passes.filter((p) => p.status === k).length})
            </button>
          ))}
        </div>
        {list.length === 0 ? (
          <div className="mt-3 flex items-center gap-4 rounded-2xl bg-surface p-4 ring-1 ring-ink/[0.07]">
            <PassSpot className="w-24 shrink-0" />
            <div className="min-w-0">
              <p className="text-body-sm font-semibold text-navy-950">{tab === "ready" ? "No passes yet" : "No used passes yet"}</p>
              <p className="mt-0.5 text-caption text-ink-muted">{tab === "ready" ? "Redeem a food, drink or wellness item and its pass appears here." : "Passes move here once you use them."}</p>
              {tab === "ready" && (
                <button type="button" onClick={() => go("app/rewards/marketplace")} className="mt-1 inline-flex min-h-11 items-center gap-1.5 text-body-sm font-semibold text-crimson-600">
                  Browse rewards <ArrowRight size={16} aria-hidden />
                </button>
              )}
            </div>
          </div>
        ) : (
          <ul className="mt-3 grid gap-2.5">
            {list.map((p) => {
              const product = findProduct(p.productId);
              return (
                <li key={p.id}>
                  <button type="button" onClick={() => go(`app/rewards/pass/${p.id}`)} className="flex w-full items-center gap-3 rounded-2xl bg-surface p-3 text-left ring-1 ring-ink/[0.07]">
                    {product?.image ? (
                      <img src={product.image} alt="" className="ge-skeleton size-12 shrink-0 rounded-xl object-cover" />
                    ) : (
                      <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl bg-gold-50 text-gold-700"><Ticket size={20} aria-hidden /></span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block text-body-sm font-semibold text-navy-950">{product?.name}</span>
                      <span className="block font-mono text-caption text-ink-muted">{p.code}</span>
                    </span>
                    <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[12px] font-bold", p.status === "ready" ? "bg-gold-50 text-gold-700" : "bg-success-50 text-success-700")}>
                      {p.status === "ready" ? "Ready to use" : "Used"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Container>

      <Container className="mt-7">
        <h2 className="text-heading text-navy-950">GREAT EMPOWER Vouchers</h2>
        {(state.vouchers ?? []).length === 0 ? (
          <div className="mt-3 flex items-center gap-4 rounded-2xl bg-surface p-4 ring-1 ring-ink/[0.07]">
            <VoucherSpot className="w-24 shrink-0" />
            <div className="min-w-0">
              <p className="text-body-sm font-semibold text-navy-950">No vouchers yet</p>
              <p className="mt-0.5 text-caption text-ink-muted">Redeemed vouchers are kept here as collectible rewards.</p>
              <button type="button" onClick={() => go("app/rewards/marketplace")} className="mt-1 inline-flex min-h-11 items-center gap-1.5 text-body-sm font-semibold text-crimson-600">
                See vouchers <ArrowRight size={16} aria-hidden />
              </button>
            </div>
          </div>
        ) : (
          <ul className="mt-3 grid gap-2.5">
            {(state.vouchers ?? []).map((v) => {
              const product = findProduct(v.productId);
              return (
                <li key={v.id} className="flex items-center gap-3 rounded-2xl bg-surface p-3 ring-1 ring-ink/[0.07]">
                  <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-navy-950 to-crimson-700 font-brand text-body-sm font-bold text-white">
                    {product?.voucher?.face}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-body-sm font-semibold text-navy-950">{product?.name}</span>
                    <span className="block font-mono text-caption text-ink-muted">{v.code}</span>
                  </span>
                  <span className="shrink-0 rounded-full bg-navy-50 px-2.5 py-1 text-[12px] font-bold text-navy-900">Saved for later</span>
                </li>
              );
            })}
          </ul>
        )}
        <p className="mt-2 text-caption text-ink-muted">
          GREAT EMPOWER doesn&apos;t sell insurance, so vouchers can&apos;t be used to pay for insurance and have no cash value.
        </p>
      </Container>

      {state.benefits.length > 0 && (
      <Container className="mt-7">
        <h2 className="text-heading text-navy-950">Retired game benefits</h2>
          <ul className="mt-3 grid gap-2.5">
            {state.benefits.map((b) => (
              <li key={b.id} className="flex items-center gap-3 rounded-2xl bg-navy-50 p-3.5">
                <ShieldCheck size={22} className="shrink-0 text-navy-800" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block text-body-sm font-semibold text-navy-950">{findProduct(b.productId)?.name}</span>
                  <span className="block text-caption text-ink-secondary">{b.benefit.effect}</span>
                </span>
                <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[12px] font-bold text-navy-900">Stored</span>
              </li>
            ))}
          </ul>
        <p className="mt-2 text-caption text-ink-muted">Shieldora and Nestora game items are no longer offered. Benefits you already redeemed stay stored here; they are simulated and have no real-world value.</p>
      </Container>
      )}

      <Container className="mt-7">
        <h2 className="flex items-center gap-2 text-heading text-navy-950"><History size={20} aria-hidden /> History</h2>
        {state.transactions.length === 0 ? (
          <p className="mt-2 text-body-sm text-ink-muted">No transactions yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-ink/10 rounded-2xl bg-surface px-4 ring-1 ring-ink/[0.07]">
            {state.transactions.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 py-3">
                <span className="min-w-0">
                  <span className="block truncate text-body-sm font-semibold text-navy-950">{t.title}</span>
                  <span className="block text-caption text-ink-muted">
                    {new Date(t.at).toLocaleString("en-MY", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    {t.detail ? ` · ${t.detail}` : ""}
                  </span>
                </span>
                <span className={cn("shrink-0 text-body-sm font-bold tabular-nums", t.points > 0 ? "text-success-700" : t.points < 0 ? "text-navy-950" : "text-ink-muted")}>
                  {t.points === 0 ? "—" : `${t.points > 0 ? "+" : "−"}${Math.abs(t.points).toLocaleString("en-MY")}`}
                </span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-caption text-ink-muted">Saved on this device only. {SIMULATED_NOTE}</p>
      </Container>
    </>
  );
}

