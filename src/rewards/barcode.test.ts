import assert from "node:assert/strict";
import test from "node:test";
import { code128BValues, code128BWidths } from "./barcode.ts";

test("Code 128-B framing and checksum", () => {
  // Checksum = (start value + sum of value x position) mod 103, worked by hand:
  // P=48 J=42 J=42 1=17 2=18 3=19 C=35 -> 104 + 48 + 84 + 126 + 68 + 90 + 114 + 245 = 879; 879 mod 103 = 55
  const v = code128BValues("PJJ123C");
  assert.equal(v[0], 104);
  assert.deepEqual(v.slice(1, -2), [48, 42, 42, 17, 18, 19, 35]);
  assert.equal(v.at(-2), 55);
  assert.equal(v.at(-1), 106);
});

test("every symbol is 11 modules; stop is 13", () => {
  const text = "GE-7K3F-92QD";
  const widths = code128BWidths(text);
  const modules = widths.reduce((a, b) => a + b, 0);
  // start + chars + checksum = (len + 2) symbols * 11, plus 13-module stop
  assert.equal(modules, (text.length + 2) * 11 + 13);
});

test("rejects characters outside subset B", () => {
  assert.throws(() => code128BValues("é"));
});
