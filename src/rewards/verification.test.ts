import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { quizzes } from "../data/quizzes.ts";
import { demoLessons } from "../data/demo-courses.ts";
import { infographics, videos } from "../data/learn-media.ts";
import { WatchMeter, gradeQuiz, watchRequirements } from "./verification.ts";

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

test("WatchMeter: seeking backward adds no time for the jump; rewatching counts as watching", () => {
  const m = new WatchMeter();
  m.start(0, 0);
  const p = play(m, { real: 0, media: 0 }, 30);
  m.tick(p.real + 250, 5); // jump back 25 s
  assert.ok(Math.abs(m.pending - 30) < 0.01, String(m.pending));
  play(m, { real: p.real + 250, media: 5 }, 10);
  assert.ok(Math.abs(m.pending - 40) < 0.01, String(m.pending));
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
