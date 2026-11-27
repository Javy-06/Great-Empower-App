import type { ResearchedProduct } from "../../data/protection.ts";

export type Channel = "direct" | "adviser" | "check" | "closed";

/** How someone would apply, read from the product's official "how to apply" wording. */
export function applicationChannel(p: ResearchedProduct): Channel {
  if (p.evidence === "ISSUER_NOTICE") return "closed";
  if (/direct online/i.test(p.howToApply)) return "direct";
  if (/agent|adviser|advisor|intermediary|call-back/i.test(p.howToApply)) return "adviser";
  return "check";
}

/** "Annual limit (PDS and official page)" → ["Annual limit", "PDS and official page"]. */
export function splitFactLabel(label: string): [string, string] {
  const m = /^(.*?)\s*\(([^)]+)\)\s*$/.exec(label);
  return m ? [m[1], m[2]] : [label, ""];
}
