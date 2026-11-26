/**
 * Learning reward verification — pure, framework-free.
 *
 *  - Quizzes: a lesson or infographic pays only on a PERFECT score.
 *  - Videos: a video pays only after enough VALID watch time has accumulated for the edition
 *    being watched. Seeking, paused time, buffering and background time never count.
 *
 * Cloud accounts: the server grades quizzes and credits watch time (bounded by real elapsed time
 * between reports); these functions then only drive the UI. Device-only accounts have no server,
 * so these functions are the whole rule set there.
 */
import { findQuiz, type Quiz } from "../data/quizzes.ts";
import { videos, type MediaLanguage } from "../data/learn-media.ts";

/* ------------------------------------------------------------------------------------ quizzes */

export type QuizAnswers = Record<string, string>;
export interface QuizGrade {
  score: number;
  total: number;
  perfect: boolean;
  results: { id: string; correct: boolean }[];
}

/** Unanswered or unknown answers count as wrong. A quiz with no questions can never be perfect. */
export function gradeQuiz(quiz: Quiz, answers: QuizAnswers): QuizGrade {
  const results = quiz.questions.map((q) => ({ id: q.id, correct: answers[q.id] === q.answer }));
  const score = results.filter((r) => r.correct).length;
  const total = quiz.questions.length;
  return { score, total, perfect: total > 0 && score === total, results };
}

export { findQuiz };

/**
 * Fisher–Yates shuffle for display order only. Questions and options keep their ids, and answers
 * are submitted by id, so shuffling never changes which answer is correct.
 */
export function shuffled<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/* ------------------------------------------------------------------------------- watch time */

/**
 * Timing tolerance: the stored durations are rounded to whole seconds and players stop a fraction
 * early, so the requirement is the edition's duration minus 2 seconds. Nothing else is forgiven.
 */
export const WATCH_TOLERANCE_SECONDS = 2;

/** Required valid watch seconds for every edition, keyed "<videoId>:<lang>". Mirrored in SQL. */
export const watchRequirements: Record<string, number> = Object.fromEntries(
  videos.flatMap((v) => [
    [`${v.id}:en`, Math.max(1, v.seconds - WATCH_TOLERANCE_SECONDS)],
    ...Object.entries(v.editions ?? {}).map(([lang, e]) => [`${v.id}:${lang}`, Math.max(1, e!.seconds - WATCH_TOLERANCE_SECONDS)]),
  ]),
);

export const watchKey = (videoId: string, lang: MediaLanguage | string) => `${videoId}:${lang}`;
export const requiredWatchSeconds = (videoId: string, lang: string) => watchRequirements[watchKey(videoId, lang)];

/** Media ranges [start, end) in seconds that have already been credited, merged and sorted. */
export type Coverage = [number, number][];

export const coveredSeconds = (c: Coverage) => c.reduce((sum, [a, b]) => sum + (b - a), 0);

/** Adds [a, b) to a coverage list. `added` is only the part that was not already covered. */
export function addCoverage(c: Coverage, a: number, b: number): { coverage: Coverage; added: number } {
  if (!(b > a)) return { coverage: c, added: 0 };
  const all = [...c, [a, b] as [number, number]].sort((p, q) => p[0] - q[0]);
  const out: Coverage = [];
  for (const [x, y] of all) {
    const last = out[out.length - 1];
    if (last && x <= last[1]) last[1] = Math.max(last[1], y);
    else out.push([x, y]);
  }
  return { coverage: out, added: Math.max(0, coveredSeconds(out) - coveredSeconds(c)) };
}

/**
 * Measures valid watch time from player events. Each reading credits
 *   min(real time elapsed, media time advanced)
 * since the previous reading, and only while a segment is open (playing, visible, not seeking).
 * So:
 *  - paused / hidden / seeking / buffering time is never counted (the segment is closed),
 *  - a seek forward cannot count (the jump happens while closed, or media advances far faster
 *    than real time and min() credits only the real time that actually passed),
 *  - fast playback cannot count faster than real time; rewinding never adds the jump itself,
 *  - footage that was already credited (`coverage`) is never credited again, so seeking back and
 *    replaying a part adds no time. Only new footage counts toward the requirement.
 */
export class WatchMeter {
  /** Already-credited media ranges for this edition (persisted per account by the caller). */
  coverage: Coverage;
  constructor(coverage: Coverage = []) {
    this.coverage = coverage.map(([a, b]) => [a, b] as [number, number]);
  }
  private open = false;
  private lastReal = 0;
  private lastMedia = 0;
  /** Credited seconds not yet reported. */
  pending = 0;

  /** Playback is running and the page is visible: start measuring from here. */
  start(realMs: number, mediaSeconds: number) {
    this.open = true;
    this.lastReal = realMs;
    this.lastMedia = mediaSeconds;
  }

  /** A playback position reading (timeupdate). */
  tick(realMs: number, mediaSeconds: number) {
    if (!this.open) return;
    const dr = (realMs - this.lastReal) / 1000;
    const m0 = this.lastMedia;
    const dm = mediaSeconds - m0;
    this.lastReal = realMs;
    this.lastMedia = mediaSeconds;
    // A big gap between readings means the page was throttled or something unusual happened;
    // crediting it would trust time nobody saw. Readings normally arrive every ~250 ms.
    if (dr <= 0 || dm <= 0 || dr > 5) return;
    // Only as much footage as real time allows, and only footage not credited before.
    const r = addCoverage(this.coverage, m0, m0 + Math.min(dr, dm));
    this.coverage = r.coverage;
    this.pending += r.added;
  }

  /** Pause, seek, buffering, hidden page, leaving the page, end of video. */
  stop(realMs: number, mediaSeconds: number) {
    if (!this.open) return;
    this.tick(realMs, mediaSeconds);
    this.open = false;
  }

  get running() {
    return this.open;
  }

  /** Take whole credited seconds for reporting (fractions carry over). */
  take(): number {
    const whole = Math.floor(this.pending);
    this.pending -= whole;
    return whole;
  }
}
