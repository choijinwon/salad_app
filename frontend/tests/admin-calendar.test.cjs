const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");
const { handler } = require("../netlify/functions/api.cjs");
const compiled = ts.transpileModule(fs.readFileSync(require.resolve("../src/ionic/adminCalendar.ts"), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const moduleState = { exports: {} };
new Function("exports", "module", compiled)(moduleState.exports, moduleState);
const { seoulToday, periodRange, monthCells, dateRangeError, parseCalendarDate, filterPeriod, dailyOperations, operationSummary } = moduleState.exports;

test("Korean date remains correct across UTC midnight and year changes", () => {
  assert.equal(seoulToday(new Date("2026-10-14T14:59:59Z")), "2026-10-14");
  assert.equal(seoulToday(new Date("2026-10-14T15:00:00Z")), "2026-10-15");
  assert.deepEqual(periodRange("previousMonth", "2026-01-15"), { from: "2025-12-01", to: "2025-12-31" });
  assert.deepEqual(periodRange("quarter", "2026-01-15"), { from: "2025-11-01", to: "2026-01-31" });
  assert.deepEqual(periodRange("week", "2026-01-03"), { from: "2025-12-28", to: "2026-01-03" });
});

test("month grid includes each leap day once and has stable six-week dimensions", () => {
  const cells = monthCells("2024-02-15");
  assert.equal(cells.length, 42);
  assert.equal(cells[0], "2024-01-28");
  assert.equal(cells[41], "2024-03-09");
  assert.equal(cells.filter((date) => date === "2024-02-29").length, 1);
  assert.equal(parseCalendarDate("2026-02-29"), null);
  assert.notEqual(dateRangeError({ from: "2026-10-31", to: "2026-10-01" }), "");
  assert.equal(dateRangeError({ from: "2024-01-01", to: "2024-12-31" }), "");
  assert.notEqual(dateRangeError({ from: "2024-01-01", to: "2025-01-01" }), "");
});

test("period totals include both endpoints, exclude incomplete money and never double count paid bags", () => {
  const base = { customer: "테스트", orderNo: "TEST", assignedDriver: "테스트기사", bagCount: 1, bagCollected: true, saladCount: 2, settlementUnitPrice: 8900, done: true };
  const deliveries = [
    { ...base, id: "a", deliveryDate: "2026-09-30" },
    { ...base, id: "b", deliveryDate: "2026-10-01" },
    { ...base, id: "c", deliveryDate: "2026-10-31", settled: true, bagCollected: false },
    { ...base, id: "d", deliveryDate: "2026-10-15", bagCollected: false },
    { ...base, id: "e", deliveryDate: "2026-10-16", done: false },
    { ...base, id: "f", deliveryDate: "2026-11-01" },
  ];
  const filtered = filterPeriod(deliveries, { from: "2026-10-01", to: "2026-10-31" });
  assert.deepEqual(filtered.map((item) => item.id), ["b", "c", "d", "e"]);
  const totals = operationSummary(filtered);
  assert.equal(totals.completedAmount, 53400);
  assert.equal(totals.availableAmount, 17800);
  assert.equal(totals.settledAmount, 17800);
  assert.equal(totals.heldAmount, 17800);
  assert.equal(totals.completedAmount, totals.availableAmount + totals.settledAmount + totals.heldAmount);
  const daily = dailyOperations(filtered);
  assert.equal([...daily.values()].reduce((sum, entry) => sum + entry.completedAmount, 0), totals.completedAmount);
  assert.equal(filterPeriod(deliveries, { from: "2026-12-01", to: "2026-12-31" }).length, 0);
});

test("period API returns both boundary dates across months and validates impossible ranges", async () => {
  const request = async (method, body, queryStringParameters) => {
    const response = await handler({ path: "/api/deliveries", httpMethod: method, body: body ? JSON.stringify(body) : null, queryStringParameters });
    return { status: response.statusCode, ...JSON.parse(response.body) };
  };
  for (const date of ["2025-12-31", "2026-01-01", "2026-01-31", "2026-02-01"]) await request("POST", { deliveryDate: date });
  const result = await request("GET", null, { from: "2026-01-01", to: "2026-01-31" });
  assert.equal(result.status, 200);
  assert.deepEqual(result.data.map((item) => item.deliveryDate), ["2026-01-01", "2026-01-31"]);
  assert.equal((await request("GET", null, { from: "2026-02-30", to: "2026-03-01" })).status, 400);
  assert.equal((await request("GET", null, { from: "2026-10-31", to: "2026-10-01" })).status, 400);
  assert.equal((await request("GET", null, { from: "2024-01-01", to: "2025-01-01" })).status, 400);
});
