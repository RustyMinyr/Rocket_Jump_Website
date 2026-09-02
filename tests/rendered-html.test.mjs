import assert from "node:assert/strict";
import test from "node:test";

async function render(path = "/", accept = "text/html") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request(`http://localhost${path}`, { headers: { accept } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
}

test("server-renders the RocketJump home page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Ideas That/);
  assert.match(html, /Launch Brands/);
  assert.match(html, /Websites That Move Businesses Forward/);
  assert.match(html, /Let(?:&#x27;|')s Launch Your Brand/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
});

test("renders every primary route", async () => {
  const routes = ["/web-design", "/branding", "/social-media", "/work", "/about", "/contact", "/client-portal", "/privacy", "/terms"];
  for (const route of routes) {
    const response = await render(route);
    assert.equal(response.status, 200, route);
    assert.match(response.headers.get("content-type") ?? "", /^text\/html/i, route);
  }
});

test("renders the client portal as a safe local preview", async () => {
  const html = await (await render("/client-portal")).text();
  assert.match(html, /CLIENT PORTAL PREVIEW/);
  assert.match(html, /No passwords, client records or approval decisions are collected/);
  assert.doesNotMatch(html, /type="password"/);
});

test("renders local SEO metadata and crawl controls", async () => {
  const home = await (await render("/")).text();
  const webDesign = await (await render("/web-design")).text();
  const portal = await (await render("/client-portal")).text();
  const robots = await (await render("/robots.txt", "text/plain")).text();
  const sitemap = await (await render("/sitemap.xml", "application/xml")).text();

  assert.match(home, /Web Design, Branding &amp; Social Media in Gqeberha \| RocketJump/);
  assert.match(home, /Gqeberha \(Port Elizabeth\)/);
  assert.match(home, /"@type":"OfferCatalog"/);
  assert.match(webDesign, /Website Design in Gqeberha &amp; Port Elizabeth \| RocketJump/);
  assert.match(webDesign, /LOCAL WEBSITE QUESTIONS/);
  assert.match(portal, /name="robots" content="noindex,? ?nofollow"/);
  assert.match(robots, /Sitemap: https:\/\/rocketjump\.co\.za\/sitemap\.xml/);
  assert.match(sitemap, /https:\/\/rocketjump\.co\.za\/web-design/);
  assert.doesNotMatch(sitemap, /client-portal/);
});

test("all rendered internal links resolve", async () => {
  const sourceRoutes = ["/", "/web-design", "/branding", "/social-media", "/work", "/about", "/contact", "/client-portal", "/privacy", "/terms"];
  const links = new Set();
  for (const route of sourceRoutes) {
    const html = await (await render(route)).text();
    for (const match of html.matchAll(/<a[^>]*href="([^"#?]+)(?:[?#][^"]*)?"/g)) {
      if (match[1].startsWith("/") && !match[1].startsWith("/_")) links.add(match[1]);
    }
  }
  for (const href of links) {
    const response = await render(href);
    assert.equal(response.status, 200, href);
  }
});
