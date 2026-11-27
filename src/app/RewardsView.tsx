import { useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
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
import {
  VOUCHER_TERMS,
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
  "Points, Marketplace brands and items are fictional and have no cash value; the brands are not real merchants. Great Empower Vouchers are for future insurance purchases, which are not available yet.";

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
        <div className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-2xl bg-surface p-4 shadow-e2 ring-1 ring-ink/5 sm:p-5">
          <div className="flex items-center gap-3">
            <span className="inline-flex size-11 items-center justify-center rounded-xl bg-gold-50 text-gold-700">
              <Coins size={22} aria-hidden />
            </span>
            <div>
              <p className="text-body-sm font-semibold text-navy-900">Your points</p>
              <p className="font-brand text-[2rem] font-bold leading-none tabular-nums text-navy-950">
                {state.points.toLocaleString("en-MY")} <span className="text-body font-semibold">pts</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => go("app/rewards/wallet")}
            className="inline-flex h-11 items-center gap-1.5 rounded-full bg-navy-900 px-4 text-body-sm font-semibold text-white hover:bg-navy-800"
          >
            <Wallet size={16} aria-hidden /> Wallet
            {ready > 0 && <span className="ml-0.5 rounded-full bg-white/20 px-1.5 text-[11px] font-bold">{ready}</span>}
          </button>
        </div>
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
          {challenges.map((c) => {
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
        <p className="mt-2 text-caption text-ink-muted">
          Earn points by passing lesson and infographic quizzes with a perfect score, watching video lessons in full
          and finishing your protection profile. Each activity pays once.
        </p>
      </Container>

      {/* Great Empower Vouchers */}
      <Container className="mt-8">
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-heading text-navy-950">Great Empower Vouchers</h2>
          <button type="button" onClick={() => go("app/rewards/marketplace/great-empower")} className="inline-flex min-h-11 items-center gap-1 text-body-sm font-semibold text-navy-900">
            View all <ArrowRight size={15} aria-hidden />
          </button>
        </div>
        <p className="mt-1 text-body-sm text-ink-secondary">
          Save towards future Great Empower insurance purchases. Insurance purchasing isn't available yet — vouchers are kept in your wallet until it is.
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
          <span className="text-overline uppercase tracking-[0.2em] text-teal-200">Great Empower</span>
          <span className="mt-1 flex items-center gap-2 font-brand text-[1.75rem] font-semibold">
            <Store size={22} aria-hidden /> Marketplace
          </span>
          <span className="mt-1 block max-w-[20rem] text-body-sm text-white/75">
            Healthy food and drinks, wellness essentials and Great Empower Vouchers.
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
      <PageHero eyebrow="Great Empower" title="Marketplace" text="Redeem healthy choices, wellness essentials and Great Empower Vouchers." backLabel="Marketplace" onBack={() => go("app/rewards")} titleId="market-title">
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
      <span className="relative text-[10px] font-bold uppercase tracking-[0.18em] text-teal-200">Great Empower</span>
      <span className="relative">
        <span className="block font-brand text-[2.5rem] font-bold leading-none">{v.face}</span>
        <span className="mt-1 block text-[11px] font-semibold text-white/80">{v.discount.type === "percent" ? `off · up to RM${v.discount.capRm}` : "off"}</span>
      </span>
      <span className="relative flex items-center gap-1.5 border-t border-dashed border-white/30 pt-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/75">
        <Ticket size={12} aria-hidden /> Future insurance voucher
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
      {welcome && (
        <span className="absolute left-2 top-2 rounded-full bg-crimson-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-white shadow-e1">
          Welcome {WELCOME_PRICE}
        </span>
      )}
      <span className="flex flex-1 flex-col p-3">
        <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-muted">{brand.name}</span>
        <span className="mt-0.5 line-clamp-2 text-body-sm font-semibold text-navy-950">{product.name}</span>
        <span className="mt-auto pt-2 text-body-sm font-bold text-crimson-600">{pts(product.price)}</span>
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
        <p className="mt-1 text-body text-ink-secondary">
          {product.name} · {pts(checkout.total)} spent. Your balance is now {pts(state.points)}.
        </p>
        {product.voucher && (
          <p className="mt-3 rounded-xl bg-navy-50 px-4 py-3 text-body-sm text-navy-900">
            Saved in your wallet for a future eligible Great Empower insurance purchase. Insurance purchasing isn't
            available yet, so it can't be used today.
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
        <p className="mt-1 text-body text-ink-secondary">{product.description}</p>
        {product.voucher && (
          <div className="mt-4 rounded-2xl bg-navy-50 p-4 text-body-sm text-navy-900">
            <p className="font-semibold">Voucher terms</p>
            <ul className="mt-2 grid list-disc gap-1.5 pl-5">
              {VOUCHER_TERMS.map((t) => (
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
            <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn("h-10 rounded-full text-caption font-bold", tab === k ? "bg-surface text-navy-950 shadow-e1" : "text-ink-muted")}>
              {k === "ready" ? "Ready to use" : "Used"} ({state.passes.filter((p) => p.status === k).length})
            </button>
          ))}
        </div>
        {list.length === 0 ? (
          <p className="mt-4 rounded-xl bg-surface px-4 py-6 text-center text-body-sm text-ink-muted ring-1 ring-ink/[0.07]">
            {tab === "ready" ? "No passes yet — redeem food, drinks or wellness items in the Rewards Hub." : "No used passes yet."}
          </p>
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
                    <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold", p.status === "ready" ? "bg-gold-50 text-gold-700" : "bg-success-50 text-success-700")}>
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
        <h2 className="text-heading text-navy-950">Great Empower Vouchers</h2>
        {(state.vouchers ?? []).length === 0 ? (
          <p className="mt-2 text-body-sm text-ink-muted">Vouchers you redeem are kept here for future Great Empower insurance purchases.</p>
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
                  <span className="shrink-0 rounded-full bg-navy-50 px-2.5 py-1 text-[11px] font-bold text-navy-900">Saved for later</span>
                </li>
              );
            })}
          </ul>
        )}
        <p className="mt-2 text-caption text-ink-muted">
          For future eligible Great Empower insurance purchases. Insurance purchasing isn't available in the app yet, so vouchers can't be used today. One voucher per purchase; vouchers can't be combined.
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
                <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-navy-900">Stored</span>
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

