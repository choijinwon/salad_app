const { test } = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const { tmpdir } = require("node:os");

test("production map build rejects missing or blank keys without exposing values", async () => {
  const { validateNetlifyEnvironment } = await import("../scripts/check_netlify_env.mjs");
  for (const value of [undefined, "", "  "]) {
    assert.throws(() => validateNetlifyEnvironment({ VITE_KAKAO_MAP_APP_KEY: value }), /VITE_KAKAO_MAP_APP_KEY is required/);
  }
  assert.doesNotThrow(() => validateNetlifyEnvironment({ VITE_KAKAO_MAP_APP_KEY: "test-browser-map-key" }));
});

test("Netlify preflight exits unsuccessfully before a keyless deployment", () => {
  const env = { ...process.env };
  delete env.VITE_KAKAO_MAP_APP_KEY;
  const script = require.resolve("../scripts/check_netlify_env.mjs");
  const missing = spawnSync(process.execPath, [script], { cwd: tmpdir(), env, encoding: "utf8" });
  assert.equal(missing.status, 1);
  assert.match(missing.stderr, /VITE_KAKAO_MAP_APP_KEY is required/);
  const key = "test-browser-map-key";
  const configured = spawnSync(process.execPath, [script], { cwd: tmpdir(), env: { ...env, VITE_KAKAO_MAP_APP_KEY: key }, encoding: "utf8" });
  assert.equal(configured.status, 0);
  assert.ok(!`${configured.stdout}${configured.stderr}`.includes(key));
});
