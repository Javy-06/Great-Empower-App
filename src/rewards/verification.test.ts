import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { quizzes } from "../data/quizzes.ts";
import { demoLessons } from "../data/demo-courses.ts";
import { infographics, videos } from "../data/learn-media.ts";
import { WatchMeter, addCoverage, coveredSeconds, gradeQuiz, shuffled, watchRequirements, type Coverage } from "./verification.ts";

const v3 = readFileSync(new URL("../../supabase/migrations/20261127000000_rewards_learning_verification.sql", import.meta.url), "utf8");

/* ----------------------------------------------------------------------------------- quizzes */

test("every lesson and every infographic has a 3-question quiz; nothing else does", () => {
  const keys = quizzes.map((q) => `${q.kind}:${q.contentId}`).sort();
  const expected = [
    ...demoLessons.map((l) => `lesson-complete:${l.id}`),
    ...infographics.map((i) => `infographic-viewed:${i.id}`),
  ].sort();
  assert.deepEqual(keys, expected);
  for (const q of quizzes) assert.equal(q.questions.length, 3, q.contentId);
});

test("questions are well-formed: 4 distinct options, a valid answer and an explanation", () => {
  for (const quiz of quizzes)
    for (const q of quiz.questions) {
      const where = `${quiz.contentId}/${q.id}`;
      assert.equal(q.options.length, 4, where);
      assert.equal(new Set(q.options.map((o) => o.text)).size, 4, where);
      assert.ok(q.options.some((o) => o.id === q.answer), where);
      assert.ok(q.prompt.length > 10 && q.explanation.length > 20, where);
    }
});

test("the correct answer is not always in the same position", () => {
  const positions = new Set(quizzes.flatMap((z) => z.questions.map((q) => q.answer)));
  assert.equal(positions.size, 4);
});

test("SQL answer key mirrors the app's quizzes exactly", () => {
  const block = v3.slice(v3.indexOf("insert into ge_private.quiz_answer_key"), v3.indexOf("insert into ge_private.video_requirement"));
  const rows = [...block.matchAll(/\('([a-z-]+)', '([a-z0-9-]+)', '(q\d+)', '([a-d])'\)/g)].map((m) => m.slice(1).join(":")).sort();
  const expected = quizzes.flatMap((z) => z.questions.map((q) => `${z.kind}:${z.contentId}:${q.id}:${q.answer}`)).sort();
  assert.deepEqual(rows, expected);
});

test("gradeQuiz: perfect only when every answer is right; unanswered counts as wrong", () => {
  const quiz = quizzes[0];
  const right = Object.fromEntries(quiz.questions.map((q) => [q.id, q.answer]));
  assert.equal(gradeQuiz(quiz, right).perfect, true);
  const oneWrong = { ...right, q2: right.q2 === "a" ? "b" : "a" };
  assert.deepEqual([gradeQuiz(quiz, oneWrong).score, gradeQuiz(quiz, oneWrong).perfect], [2, false]);
  assert.deepEqual([gradeQuiz(quiz, {}).score, gradeQuiz(quiz, {}).perfect], [0, false]);
  assert.equal(gradeQuiz({ ...quiz, questions: [] }, {}).perfect, false);
});

/* -------------------------------------------------------------------------------- watch time */

test("watch requirements: every video edition, duration minus 2 s; mirrored in SQL", () => {
  for (const v of videos) {
    assert.equal(watchRequirements[`${v.id}:en`], v.seconds - 2);
    for (const [lang, e] of Object.entries(v.editions ?? {})) assert.equal(watchRequirements[`${v.id}:${lang}`], e!.seconds - 2);
  }
  const block = v3.slice(v3.indexOf("insert into ge_private.video_requirement"));
  const rows = Object.fromEntries([...block.matchAll(/\('([a-z0-9-]+)', '([a-z]{2})', (\d+)\)/g)].map((m) => [`${m[1]}:${m[2]}`, Number(m[3])]));
  assert.deepEqual(rows, watchRequirements);
});

/** Simulate a player: readings every 250 ms of real time. */
function play(m: WatchMeter, from: { real: number; media: number }, seconds: number, rate = 1) {
  let { real, media } = from;
  for (let i = 0; i < seconds * 4; i++) {
    real += 250;
    media += 0.25 * rate;
    m.tick(real, media);
  }
  return { real, media };
}

test("WatchMeter: normal playback counts real time watched", () => {
  const m = new WatchMeter();
  m.start(0, 0);
  play(m, { real: 0, media: 0 }, 60);
  assert.ok(Math.abs(m.pending - 60) < 0.01, String(m.pending));
});

test("WatchMeter: paused time does not count", () => {
  const m = new WatchMeter();
  m.start(0, 0);
  let p = play(m, { real: 0, media: 0 }, 10);
  m.stop(p.real, p.media); // pause
  m.tick(p.real + 120_000, p.media); // readings while paused are ignored
  m.start(p.real + 120_000, p.media); // resume two minutes later
  p = play(m, { real: p.real + 120_000, media: p.media }, 10);
  assert.ok(Math.abs(m.pending - 20) < 0.01, String(m.pending));
});

test("WatchMeter: hidden page / leaving the page stops counting", () => {
  const m = new WatchMeter();
  m.start(0, 0);
  const p = play(m, { real: 0, media: 0 }, 5);
  m.stop(p.real, p.media); // visibilitychange → hidden (or unmount)
  play(m, p, 60); // video keeps playing in the background
  assert.ok(Math.abs(m.pending - 5) < 0.01, String(m.pending));
  assert.equal(m.running, false);
});

test("WatchMeter: seeking forward does not count the jump", () => {
  const m = new WatchMeter();
  m.start(0, 0);
  let p = play(m, { real: 0, media: 0 }, 5);
  // Drag to near the end without a seeking event (worst case): one reading jumps 470 s of media.
  m.tick(p.real + 250, 475);
  assert.ok(m.pending < 5.3, String(m.pending));
  // With the normal events: seeking closes the segment, seeked + playing reopens it.
  p = { real: p.real + 250, media: 475 };
  m.stop(p.real, p.media);
  m.start(p.real + 100, 478);
  play(m, { real: p.real + 100, media: 478 }, 3);
  assert.ok(m.pending < 8.4, String(m.pending));
});

test("WatchMeter: seeking backward and replaying already-watched footage adds no time", () => {
  const m = new WatchMeter();
  m.start(0, 0);
  const p = play(m, { real: 0, media: 0 }, 30);
  m.tick(p.real + 250, 5); // jump back 25 s
  assert.ok(Math.abs(m.pending - 30) < 0.01, String(m.pending));
  const q = play(m, { real: p.real + 250, media: 5 }, 10); // replays 5 → 15: already credited
  assert.ok(Math.abs(m.pending - 30) < 0.01, String(m.pending));
  play(m, q, 20); // 15 → 35: only 30 → 35 is new footage
  assert.ok(Math.abs(m.pending - 35) < 0.05, String(m.pending));
});

test("WatchMeter: coverage carries across visits, so a new session cannot recount old footage", () => {
  const first = new WatchMeter();
  first.start(0, 0);
  const p = play(first, { real: 0, media: 0 }, 20);
  first.stop(p.real, p.media);
  const again = new WatchMeter(first.coverage); // next visit, coverage restored from storage
  again.start(0, 0);
  const q = play(again, { real: 0, media: 0 }, 25); // 0 → 25: only 20 → 25 is new
  assert.ok(Math.abs(again.pending - 5) < 0.05, String(again.pending));
  assert.ok(Math.abs(coveredSeconds(again.coverage) - 25) < 0.05);
  assert.ok(q.media > 24);
});

test("addCoverage merges ranges and reports only new seconds", () => {
  let c: Coverage = [];
  let r = addCoverage(c, 0, 10); c = r.coverage; assert.equal(r.added, 10);
  r = addCoverage(c, 20, 30); c = r.coverage; assert.equal(r.added, 10);
  r = addCoverage(c, 5, 25); c = r.coverage; assert.equal(r.added, 10);
  assert.deepEqual(c, [[0, 30]]);
  r = addCoverage(c, 0, 30); assert.equal(r.added, 0);
  r = addCoverage(c, 40, 40); assert.equal(r.added, 0);
});

test("WatchMeter: 2x playback over the whole video can still reach the requirement on a second pass", () => {
  const m = new WatchMeter();
  m.start(0, 0);
  let p = play(m, { real: 0, media: 0 }, 43, 2); // whole 86 s video at 2x
  const firstPass = m.pending;
  assert.ok(firstPass <= 43.05, String(firstPass));
  m.stop(p.real, p.media);
  m.start(p.real, 0); // replay at 1x: the gaps left by 2x are new footage
  p = play(m, { real: p.real, media: 0 }, 86);
  assert.ok(m.pending > 85, String(m.pending));
});

test("WatchMeter: fast playback never counts faster than real time", () => {
  const m = new WatchMeter();
  m.start(0, 0);
  play(m, { real: 0, media: 0 }, 30, 2);
  assert.ok(Math.abs(m.pending - 30) < 0.01, `2x for 30 s real credits 30 s, got ${m.pending}`);
});

test("WatchMeter: a long gap between readings (throttled tab) is not credited", () => {
  const m = new WatchMeter();
  m.start(0, 0);
  m.tick(60_000, 60);
  assert.equal(m.pending, 0);
});

test("WatchMeter.take hands out whole seconds and keeps the fraction", () => {
  const m = new WatchMeter();
  m.start(0, 0);
  play(m, { real: 0, media: 0 }, 2.5);
  assert.equal(m.take(), 2);
  assert.ok(Math.abs(m.pending - 0.5) < 0.01);
});

test("shuffled display order keeps every item and never changes which answer is correct", () => {
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const seen = new Set<string>();
  for (const quiz of quizzes) {
    const order = shuffled(quiz.questions.map((q) => q.id), rand);
    assert.deepEqual([...order].sort(), quiz.questions.map((q) => q.id).sort());
    // Answer by id after shuffling options: still a perfect score.
    const answers: Record<string, string> = {};
    for (const q of quiz.questions) {
      const opts = shuffled(q.options, rand);
      assert.equal(opts.length, 4);
      seen.add(opts.map((o) => o.id).join(""));
      answers[q.id] = opts.find((o) => o.id === q.answer)!.id;
    }
    assert.equal(gradeQuiz(quiz, answers).perfect, true);
  }
  assert.ok(seen.size > 1, "options are actually reordered");
  assert.deepEqual(shuffled([1, 2, 3], () => 0.999).sort(), [1, 2, 3]);
});
