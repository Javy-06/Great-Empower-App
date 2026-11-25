import { advisors as allAdvisors, type Advisor, type Ethnicity } from "../../data/advisors.ts";

/**
 * Guidance-session advisor trios.
 *
 * GUARANTEE: every trio is exactly one Malay, one Malaysian Chinese and one Malaysian Indian
 * advisor. This is structural, not statistical — the trio is built by drawing ONE advisor from
 * EACH ethnicity pool, so randomness only decides which individual represents each group.
 * `assertValidTrio` re-checks the result and throws if the invariant were ever broken.
 */
export const TRIO_ORDER: Ethnicity[] = ["malay", "chinese", "indian"];

/** Small deterministic PRNG (mulberry32) so a given seed always yields the same trio. */
export function seededRandom(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class InvalidTrioError extends Error {}

export function assertValidTrio(trio: readonly Advisor[]): readonly [Advisor, Advisor, Advisor] {
  if (trio.length !== 3) throw new InvalidTrioError(`Trio must have 3 advisors, got ${trio.length}.`);
  if (new Set(trio.map((a) => a.id)).size !== 3) throw new InvalidTrioError("Trio contains a duplicate advisor.");
  for (const ethnicity of TRIO_ORDER) {
    const count = trio.filter((a) => a.ethnicity === ethnicity).length;
    if (count !== 1) throw new InvalidTrioError(`Trio must have exactly one ${ethnicity} advisor, got ${count}.`);
  }
  return trio as readonly [Advisor, Advisor, Advisor];
}

/**
 * One advisor from each ethnicity pool, in Malay → Chinese → Indian order.
 * `random` defaults to Math.random; pass `seededRandom(key)` for a stable trio per session.
 */
export function pickAdvisorTrio(
  random: () => number = Math.random,
  pool: readonly Advisor[] = allAdvisors,
): readonly [Advisor, Advisor, Advisor] {
  const trio = TRIO_ORDER.map((ethnicity) => {
    const group = pool.filter((a) => a.ethnicity === ethnicity);
    if (group.length === 0) throw new InvalidTrioError(`No ${ethnicity} advisor available.`);
    const index = Math.min(group.length - 1, Math.floor(random() * group.length));
    return group[index];
  });
  return assertValidTrio(trio);
}

/** Stable trio for a specific session slot (same slot → same three advisors on every render). */
export const trioForSession = (sessionKey: string) => pickAdvisorTrio(seededRandom(sessionKey));
