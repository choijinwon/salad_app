import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import test from "node:test";

const templateRoot = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the salad delivery architecture shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>샐러드 정기배송 운영 아키텍처<\/title>/i);
  assert.match(html, /Salad Store Delivery OS/);
  assert.match(html, /관리자/);
  assert.match(html, /기사/);
  assert.match(html, /고객/);
  assert.doesNotMatch(html, /Your site is taking shape/);
  assert.doesNotMatch(html, /react-loading-skeleton/);
});

test("starter preview files are removed from the finished site", async () => {
  await assert.rejects(access(new URL("app/_sites-preview", templateRoot)));
});
