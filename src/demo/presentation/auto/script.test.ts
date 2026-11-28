import assert from "node:assert/strict";
import { test } from "node:test";
import { SAMPLE, features, sampleDay, totalSteps } from "./script.ts";

const TOPICS = ["overview", "youth-gap", "learn", "check", "gap", "how-protection-works", "compare", "get-cover", "adviser", "simulate", "rewards", "lifetrack", "impact"];

test("every topic has a feature walkthrough, in presentation order", () => {
  assert.deepEqual(features.map((f) => f.topic), TOPICS);
});

test("step ids are unique, every step explains itself, and only LifeTrack waits for the presenter", () => {
  const ids = features.flatMap((f) => f.steps.map((s) => s.id));
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(totalSteps(), ids.length);
  for (const f of features) for (const s of f.steps) assert.ok(s.caption.length > 12, `${f.id}/${s.id}`);
  const waits = features.flatMap((f) => f.steps.filter((s) => s.presenter).map((s) => s.id));
  assert.deepEqual(waits, ["lt-open"]);
  assert.match(features.find((f) => f.id === "lifetrack")!.steps[1].presenter!.href, /^https:\/\/lifetrack-plum\.vercel\.app\/$/);
});

test("all four protection categories are demonstrated", () => {
  const how = features.find((f) => f.id === "how")!.steps.map((s) => s.id);
  for (const slug of ["medical", "critical-illness", "life", "personal-accident"]) assert.ok(how.some((id) => id.startsWith(`how-${slug}-`)), slug);
});

test("sample data is fictional and the preferred day is in the future", () => {
  assert.match(SAMPLE.email, /@example\.com$/);
  assert.equal(SAMPLE.phone, "012-000 0000");
  const day = sampleDay(new Date(2026, 10, 28));
  assert.equal(day, "2026-12-01");
});
