import assert from "node:assert/strict";
import test from "node:test";
import { validatePlate } from "./plate.ts";

test("accepts old and Mercosul formats after normalization", () => {
  assert.deepEqual(validatePlate(" abc-1234 "), { valid: true, normalized: "ABC1234", format: "old" });
  assert.deepEqual(validatePlate("abc1d23"), { valid: true, normalized: "ABC1D23", format: "mercosul" });
});

test("rejects unsupported patterns and characters", () => {
  assert.equal(validatePlate("ABC123").valid, false);
  assert.equal(validatePlate("AB11234").valid, false);
  assert.equal(validatePlate("ABC12D3").valid, false);
  assert.equal(validatePlate("ABC1É23").valid, false);
  assert.equal(validatePlate("ABC_1234").valid, false);
});
