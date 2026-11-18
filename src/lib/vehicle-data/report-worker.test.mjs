import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { MockVehicleDataProvider } from "./mock-provider.ts";
import { completeModules, essentialModules, referenceCosts } from "./modules.ts";
import { estimateJobCost, runPaidReport } from "./report-worker.ts";

const config = completeModules.map((code) => ({ code, enabled: true, licenseApproved: true, estimatedCostCents: referenceCosts[code] }));
const order = { id: "synthetic-order", status: "paid", plate: "ABC1D23", modules: completeModules };
const fixedTime = () => "2026-11-18T12:00:00.000Z";

test("reference costs match approved plan baselines", () => {
  assert.equal(estimateJobCost(essentialModules, config), 971);
  assert.equal(estimateJobCost(completeModules, config), 2970);
});

test("never calls a provider before payment, license or budget approval", async () => {
  let calls = 0;
  const provider = { async query() { calls += 1; throw new Error("must not run"); } };
  await assert.rejects(runPaidReport({ ...order, status: "pending" }, config, provider, 2970));
  await assert.rejects(runPaidReport(order, config.map((item) => ({ ...item, licenseApproved: item.code !== "leilao" })), provider, 2970));
  await assert.rejects(runPaidReport(order, config, provider, 2969));
  assert.equal(calls, 0);
});

test("queries every contracted module, including auction, and marks failures unavailable", async () => {
  const provider = new MockVehicleDataProvider({ nacional: "clear", leilao: "alert", fipe: "unavailable", gravame: "no_data" });
  const report = await runPaidReport(order, config, provider, 2970, fixedTime);
  assert.equal(report.length, 10);
  assert.equal(report.find((item) => item.module === "leilao")?.state, "alert");
  assert.equal(report.find((item) => item.module === "gravame")?.state, "not_found");
  assert.equal(report.find((item) => item.module === "fipe")?.state, "unavailable");
  assert.equal(report.find((item) => item.module === "fipe")?.actualCostCents, null);
});

test("rejects invalid provider output as unavailable", async () => {
  const provider = { async query() { return { state: "clear", sourceName: "unsafe", findings: [{ code: "raw", text: "x".repeat(1000) }] }; } };
  const report = await runPaidReport({ ...order, modules: ["nacional"] }, config, provider, 110, fixedTime);
  assert.equal(report[0].state, "unavailable");
  assert.deepEqual(report[0].findings, []);
});

for (const fixture of ["complete", "partial"]) {
  test(`synthetic ${fixture} fixture covers every module`, async () => {
    const scenarios = JSON.parse(readFileSync(new URL(`./fixtures/${fixture}.json`, import.meta.url), "utf8"));
    assert.deepEqual(Object.keys(scenarios).sort(), [...completeModules].sort());
    const report = await runPaidReport(order, config, new MockVehicleDataProvider(scenarios), 2970, fixedTime);
    assert.equal(report.length, 10);
    assert.ok(report.every((item) => item.sourceName.startsWith("Fixture") || item.state === "unavailable"));
  });
}
