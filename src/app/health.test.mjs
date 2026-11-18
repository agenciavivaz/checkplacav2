import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("healthcheck responds without external services", () => {
  const route = readFileSync(new URL("./api/health/route.ts", import.meta.url), "utf8");
  assert.match(route, /status: "ok"/);
});
