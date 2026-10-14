const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");
const { handler } = require("../netlify/functions/api.cjs");
const compiled = ts.transpileModule(fs.readFileSync(require.resolve("../src/ionic/deliveryCoverage.ts"), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const geometry = { exports: {} };
new Function("exports", "module", compiled)(geometry.exports, geometry);
const { pointInZone, zonePolygonError } = geometry.exports;
const boundary = [[37.50, 127.00], [37.52, 127.00], [37.52, 127.03], [37.50, 127.03]];
const crossing = [boundary[0], boundary[2], boundary[1], boundary[3]];
const request = async (path, method = "GET", body) => {
  const response = await handler({ path: `/api${path}`, httpMethod: method, body: body ? JSON.stringify(body) : null });
  return { status: response.statusCode, ...JSON.parse(response.body) };
};

test("contains interior and boundary delivery coordinates, excludes outside", () => {
  assert.equal(zonePolygonError(boundary), "");
  assert.equal(pointInZone([37.51, 127.01], boundary), true);
  assert.equal(pointInZone(boundary[0], boundary), true);
  assert.equal(pointInZone([37.54, 127.01], boundary), false);
});

test("rejects crossed, duplicated, degenerate and invalid coordinates", () => {
  for (const points of [crossing, [boundary[0], boundary[1]], [[37.5, 127], [37.51, 127.01], [37.52, 127.02]], [...boundary, boundary[0]], [[91, 127], ...boundary], [[NaN, 127], ...boundary]]) {
    assert.notEqual(zonePolygonError(points), "");
  }
});

test("zone API saves, loads and modifies geometry without losing it in legacy updates", async () => {
  const created = await request("/zones", "POST", { zoneName: "테스트 배송 범위", boundary, color: "#16a34a" });
  assert.equal(created.status, 200);
  assert.deepEqual(created.data.boundary, boundary);
  const changed = boundary.map(([lat, lng]) => [lat + 0.005, lng]);
  const updated = await request(`/zones/${created.data.id}`, "PATCH", { zoneName: "테스트 배송 범위", boundary: changed, color: "#155eef" });
  assert.deepEqual(updated.data.boundary, changed);
  const legacy = await request(`/zones/${created.data.id}`, "PATCH", { zoneName: "테스트 배송 범위", description: "담당 구역" });
  assert.deepEqual(legacy.data.boundary, changed);
  assert.equal(legacy.data.color, "#155eef");
  const loaded = await request("/zones");
  assert.deepEqual(loaded.data.find((zone) => zone.id === created.data.id).boundary, changed);
  assert.equal((await request("/zones", "POST", { zoneName: "테스트 배송 범위", boundary })).status, 409);
  assert.equal((await request(`/zones/${created.data.id}`, "PATCH", { zoneName: "테스트 배송 범위", boundary: crossing })).status, 400);
  assert.equal((await request("/zones/missing", "PATCH", { zoneName: "없는 구역", boundary })).status, 404);
});
