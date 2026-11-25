import { useState } from "react";
import { ArrowLeft, CheckCircle2, Download, Loader2, XCircle } from "lucide-react";
import { Container } from "@/components/layout/Editorial";
import { cn } from "@/lib/cn";
import { code128BWidths } from "@/rewards/barcode";
import { findBrand, findProduct } from "@/rewards/catalogue";
import { rewardsActions, useRewards } from "@/rewards/store";

const go = (hash: string) => {
  window.location.hash = hash;
  window.scrollTo({ top: 0 });
};

/** Code 128 barcode drawn as SVG bars. */
export function Barcode({ value, className }: { value: string; className?: string }) {
  const widths = code128BWidths(value);
  const quiet = 10;
  const total = widths.reduce((a, b) => a + b, 0) + quiet * 2;
  let x = quiet;
  return (
    <svg viewBox={`0 0 ${total} 60`} preserveAspectRatio="none" className={className} role="img" aria-label={`Barcode ${value}`}>
      <rect width={total} height="60" fill="#fff" />
      {widths.map((w, i) => {
        const bar = i % 2 === 0;
        const r = bar ? <rect key={i} x={x} y="0" width={w} height="60" fill="#0a1c33" /> : null;
        x += w;
        return r;
      })}
    </svg>
  );
}

/** Draws a downloadable PNG ticket on a canvas — no network, no personal data. */
function downloadTicket(code: string, product: string, brand: string) {
  const c = document.createElement("canvas");
  c.width = 900;
  c.height = 520;
  const g = c.getContext("2d")!;
  g.fillStyle = "#0a1c33";
  g.fillRect(0, 0, 900, 520);
  g.fillStyle = "#ffffff";
  g.beginPath();
  g.roundRect(40, 40, 820, 440, 28);
  g.fill();
  g.fillStyle = "#c8102e";
  g.font = "700 22px Inter, sans-serif";
  g.fillText("GREAT EMPOWER · IN-GAME PASS", 80, 100);
  g.fillStyle = "#0a1c33";
  g.font = "700 36px Inter, sans-serif";
  g.fillText(product, 80, 150);
  g.fillStyle = "#5a6a7e";
  g.font = "500 22px Inter, sans-serif";
  g.fillText(brand, 80, 185);
  const widths = code128BWidths(code);
  const modules = widths.reduce((a, b) => a + b, 0);
  const unit = Math.floor(680 / modules) || 2;
  let x = 450 - (modules * unit) / 2;
  widths.forEach((w, i) => {
    if (i % 2 === 0) {
      g.fillStyle = "#0a1c33";
      g.fillRect(x, 220, w * unit, 140);
    }
    x += w * unit;
  });
  g.fillStyle = "#0a1c33";
  g.font = "700 30px ui-monospace, Menlo, monospace";
  g.textAlign = "center";
  g.fillText(code, 450, 405);
  g.fillStyle = "#5a6a7e";
  g.font = "500 18px Inter, sans-serif";
  g.fillText("Simulated in-game pass · fictional brand · no cash or real-world value", 450, 450);
  c.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `great-empower-pass-${code}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }, "image/png");
}

export function PassView({ id }: { id: string }) {
  const state = useRewards();
  const pass = (state.passes ?? []).find((p) => p.id === id);
  const [step, setStep] = useState<"idle" | "confirm" | "saving">("idle");
  const [error, setError] = useState<string | null>(null);

  if (!pass) {
    return (
      <Container className="py-12 text-center">
        <p className="text-body text-ink-secondary">This pass could not be found.</p>
        <button type="button" onClick={() => go("app/rewards/wallet")} className="mt-4 inline-flex h-12 items-center rounded-full bg-navy-900 px-5 text-body-sm font-semibold text-white">
          Open wallet
        </button>
      </Container>
    );
  }
  const product = findProduct(pass.productId);
  const brand = product ? findBrand(product.brand) : undefined;
  const used = pass.status === "used";

  const confirm = () => {
    if (step === "saving") return;
    setStep("saving");
    const r = rewardsActions.confirmPassUsed(pass.id);
    if (!r.ok) setError(r.error);
    setStep("idle");
  };

  return (
    <div className="min-h-[70vh] bg-navy-950 pb-8 pt-3 text-white">
      <Container className="max-w-[30rem]">
        <button type="button" onClick={() => go("app/rewards/wallet")} className="-ml-2 inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-body-sm font-semibold text-white/80 hover:text-white">
          <ArrowLeft size={18} aria-hidden /> Wallet
        </button>

        <div className={cn("mt-3 overflow-hidden rounded-[1.5rem] bg-white text-navy-950 shadow-e3", used && "opacity-80")}>
          <div className="flex items-center gap-3 p-5 pb-3">
            {brand && <img src={brand.logo} alt="" className="size-12 rounded-xl object-contain ring-1 ring-ink/10" />}
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-crimson-600">In-game pass</p>
              <h1 className="font-brand text-[1.625rem] font-semibold leading-tight">{product?.name}</h1>
              <p className="text-caption text-ink-muted">{brand?.name}</p>
            </div>
          </div>
          <div className="relative border-y border-dashed border-ink/15 bg-white px-5 py-5">
            <Barcode value={pass.code} className="h-24 w-full" />
            <p className="mt-2 text-center font-mono text-[1.25rem] font-bold tracking-[0.12em]">{pass.code}</p>
            {used && (
              <span className="absolute inset-0 flex items-center justify-center bg-white/70">
                <span className="rotate-[-8deg] rounded-xl border-4 border-success-600 px-4 py-1 text-heading font-black uppercase text-success-700">Used</span>
              </span>
            )}
          </div>
          <div className="flex items-center justify-between gap-3 p-5 pt-3 text-caption">
            <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-bold", used ? "bg-success-50 text-success-700" : "bg-gold-50 text-gold-700")}>
              {used ? <CheckCircle2 size={14} aria-hidden /> : null}
              {used ? `Used ${new Date(pass.usedAt!).toLocaleString("en-MY", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}` : "Ready to use"}
            </span>
            <span className="text-ink-muted">Issued {new Date(pass.issuedAt).toLocaleDateString("en-MY")}</span>
          </div>
        </div>

        <p className="mt-3 text-center text-caption text-white/60">
          Simulated in-game pass for a fictional brand. It has no cash value and can't be used at real shops.
        </p>

        <button
          type="button"
          onClick={() => downloadTicket(pass.code, product?.name ?? "Marketplace item", brand?.name ?? "")}
          className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white/10 text-body-sm font-semibold text-white ring-1 ring-white/20 hover:bg-white/15"
        >
          <Download size={18} aria-hidden /> Download pass (PNG)
        </button>

        {!used && step === "idle" && (
          <button type="button" onClick={() => setStep("confirm")} className="mt-3 inline-flex h-14 w-full items-center justify-center rounded-full bg-crimson-600 text-body font-bold text-white hover:bg-crimson-700">
            Confirm I used this voucher
          </button>
        )}
        {!used && step !== "idle" && (
          <div className="mt-3 rounded-2xl bg-white/10 p-4 ring-1 ring-white/15" role="alertdialog" aria-label="Confirm use">
            <p className="text-body font-semibold">Mark this pass as used?</p>
            <p className="mt-0.5 text-body-sm text-white/75">This can't be undone. Only confirm after you've used it.</p>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={confirm} disabled={step === "saving"} className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-crimson-600 text-body-sm font-bold text-white disabled:opacity-70">
                {step === "saving" && <Loader2 size={16} className="animate-spin" aria-hidden />} Yes, I used it
              </button>
              <button type="button" onClick={() => setStep("idle")} className="inline-flex h-12 items-center rounded-full px-5 text-body-sm font-semibold text-white ring-1 ring-white/30">
                Not yet
              </button>
            </div>
          </div>
        )}
        {error && (
          <p role="alert" className="mt-3 flex items-center gap-2 rounded-xl bg-error-50 px-4 py-3 text-body-sm font-semibold text-error-700">
            <XCircle size={18} aria-hidden /> {error}
          </p>
        )}
        {!used && (
          <p className="mt-3 text-center text-caption text-white/60">
            Not using it now? It stays “Ready to use” in your wallet.
          </p>
        )}
      </Container>
    </div>
  );
}
