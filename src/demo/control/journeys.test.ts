import assert from "node:assert/strict";
import { test } from "node:test";
import { DEMO_REWARD_ID, DEMO_VIDEO_ID, findJourney, followStep, journeys } from "./journeys.ts";
import { videos } from "../../data/learn-media.ts";
import { DEMO_EARNED } from "../../account/seed.ts";

const ctx = (hash: string, signals: string[] = [], earned: string[] = []) => ({ hash, signals, earned });

test("every journey has unique steps with a hint, and starts on a screen", () => {
  for (const j of journeys) {
    assert.ok(j.steps.length >= 3, j.id);
    assert.equal(new Set(j.steps.map((s) => s.id)).size, j.steps.length, j.id);
    assert.ok(j.steps[0].route, `${j.id} first step opens a screen`);
    for (const s of j.steps) assert.ok(s.hint.length > 10, `${j.id}/${s.id} hint`);
  }
});

test("the Learn journey uses a real video the sample profile hasn't earned yet", () => {
  assert.ok(videos.some((v) => v.id === DEMO_VIDEO_ID));
  assert.ok(!DEMO_EARNED.some(([kind, id]) => kind === "video-finished" && (id as string) === DEMO_VIDEO_ID));
  assert.match(DEMO_REWARD_ID, /^gev-/);
});

test("the indicator follows forward only, and never without a match", () => {
  const learn = findJourney("learn")!;
  // Free exploration somewhere unrelated: stays put.
  assert.equal(followStep(learn, 1, ctx("app/simulate")), 1);
  // Opening the video moves to "Open a video".
  assert.equal(followStep(learn, 0, ctx(`app/learn/video/${DEMO_VIDEO_ID}`)), 1);
  // Earning the points jumps to "Points earned".
  assert.equal(followStep(learn, 2, ctx(`app/learn/video/${DEMO_VIDEO_ID}`, [], [`video-finished:${DEMO_VIDEO_ID}`])), 4);
  // Going back to Learn home never moves the indicator backwards.
  assert.equal(followStep(learn, 4, ctx("app/learn")), 4);
});

test("the Rewards journey follows the real checkout signals", () => {
  const r = findJourney("rewards")!;
  assert.equal(followStep(r, 2, ctx(`app/rewards/product/${DEMO_REWARD_ID}`, ["reward-confirm"])), 3);
  assert.equal(followStep(r, 3, ctx(`app/rewards/product/${DEMO_REWARD_ID}`, ["reward-confirm", "reward-done"])), 4);
  assert.equal(followStep(r, 4, ctx("app/rewards/wallet", ["reward-confirm", "reward-done"])), 5);
});
