import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);

test("tracker labels provenance and provides official Berkeley information", async () => {
  const app = await readFile(new URL("src/App.jsx", root), "utf8");
  assert.match(app, /Community beta/);
  assert.match(app, /Unofficial/);
  assert.match(app, /Not affiliated with the City of Berkeley/);
  assert.match(app, /\(510\) 981-7270/);
  assert.match(app, /berkeleyca\.gov\/city-services\/trash-recycling\/residential-waste-services/);
  assert.match(app, /Three agreeing reports/);
  assert.match(app, /Reports expire after 180 days/);
});

test("report form has no identity, exact-address, comment, photo, or location field", async () => {
  const html = await readFile(new URL("src/App.jsx", root), "utf8");
  for (const prohibited of ["name", "email", "phone", "address", "comment", "photo", "latitude", "longitude"]) {
    assert.doesNotMatch(html, new RegExp(`name=["']${prohibited}["']`, "i"));
  }
  assert.match(html, /name="block"/);
  assert.match(html, /name="stream"/);
  assert.match(html, /name="day"/);
  assert.match(html, /name="confirmed"/);
});

test("privacy page states collected and excluded data", async () => {
  const html = await readFile(new URL("privacy.html", root), "utf8");
  assert.match(html, /does not ask for your name, email, phone number, account, exact/i);
  assert.match(html, /hosting provider may temporarily process standard connection data/i);
  assert.match(html, /Reports contribute to the schedule for 180 days/i);
  assert.match(html, /does not\s+sell community-report data/i);
});

test("map uses real cross streets in order with complete data attribution", async () => {
  const html = await readFile(new URL("src/App.jsx", root), "utf8");
  const model = await readFile(new URL("src/map-data.mjs", root), "utf8");
  const streets = ["Addison Street", "Allston Way", "Bancroft Way", "Channing Way", "Dwight Way"];
  let previousIndex = -1;

  for (const street of streets) {
    const currentIndex = model.indexOf(street);
    assert.ok(currentIndex > previousIndex, `${street} should appear in corridor order`);
    previousIndex = currentIndex;
  }

  assert.match(html, /OpenFreeMap/);
  assert.match(html, /OpenMapTiles/);
  assert.match(html, /© OpenStreetMap contributors/);
  assert.ok(html.indexOf("© OpenStreetMap contributors") > html.indexOf("<footer>"));
  assert.match(html, /City of Berkeley Streets Network/);
  assert.match(html, /WestBerkeleyMap/);
  assert.match(html, /selected-report-total/);
  assert.match(html, /selected-stream-coverage/);
});

test("map has an accessible non-canvas range selector and honest coverage copy", async () => {
  const map = await readFile(new URL("src/WestBerkeleyMap.jsx", root), "utf8");
  assert.match(map, /Search supported ranges/);
  assert.match(map, /No live community range matches that search yet/);
  assert.match(map, /aria-pressed/);
  assert.match(map, /Map unavailable/);
  assert.doesNotMatch(map, /verified|confidence|\d+%/i);
});

test("selected range uses a location pin instead of punctuation", async () => {
  const html = await readFile(new URL("src/App.jsx", root), "utf8");
  const start = html.indexOf('function BlockSummary');
  const end = html.indexOf('function WeeklyCalendar');
  const summary = html.slice(start, end);

  assert.match(summary, /selected-range-pin/);
  assert.doesNotMatch(summary, /· 9th Street/);
});

test("React UI uses recognizable inline collection symbols", async () => {
  const app = await readFile(new URL("src/App.jsx", root), "utf8");
  const icons = await readFile(new URL("src/CollectionIcon.jsx", root), "utf8");

  assert.match(app, /CollectionIcon/);
  assert.match(icons, /type === "trash"/);
  assert.match(icons, /type === "recycling"/);
  assert.match(icons, /♻/);
  assert.match(icons, /collection-icon/);
});

test("MapLibre canvas shell and accessible results are styled", async () => {
  const css = await readFile(new URL("src/styles.css", root), "utf8");
  assert.match(css, /\.map-canvas/);
  assert.match(css, /\.map-search-results/);
  assert.match(css, /\.range-list/);
});

test("privacy page discloses third-party map tile requests", async () => {
  const html = await readFile(new URL("privacy.html", root), "utf8");
  assert.match(html, /OpenFreeMap/i);
  assert.match(html, /map tiles/i);
  assert.match(html, /IP address/i);
});

test("light theme, generated logo, and weekly calendar are present", async () => {
  const app = await readFile(new URL("src/App.jsx", root), "utf8");
  const css = await readFile(new URL("src/styles.css", root), "utf8");
  const logo = await readFile(new URL("public/berkeley-trash-day-logo.png", root));

  assert.match(css, /color-scheme: light/);
  assert.match(app, /berkeley-trash-day-logo\.png/);
  assert.doesNotMatch(app, />BT</);
  assert.ok(logo.byteLength > 0);
  assert.match(app, /function WeeklyCalendar/);
  assert.match(app, /Community week/);
  assert.match(app, /Holiday changes may not appear/);
});
