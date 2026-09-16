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
  assert.match(app, /one recent report publishes a community result/);
  assert.match(app, /Reports expire after 180 days/);
});

test("report form has no identity, exact-address, comment, photo, or location field", async () => {
  const html = await readFile(new URL("src/App.jsx", root), "utf8");
  for (const prohibited of ["name", "email", "phone", "address", "comment", "photo", "latitude", "longitude"]) {
    assert.doesNotMatch(html, new RegExp(`name=["']${prohibited}["']`, "i"));
  }
  assert.match(html, /name="block"/);
  assert.match(html, /type="checkbox" name="streams"/);
  assert.match(html, /Select every cart collected on that day/);
  assert.match(html, /name="day"/);
  assert.match(html, /name="confirmed"/);
});

test("privacy page states collected and excluded data", async () => {
  const html = await readFile(new URL("privacy.html", root), "utf8");
  assert.match(html, /does not ask for your name, email, phone number, account, exact/i);
  assert.match(html, /hosting provider may temporarily process standard connection data/i);
  assert.match(html, /Reports contribute to the schedule for 180 days/i);
  assert.match(html, /does not\s+sell community-report data/i);
  assert.match(html, /remembers the currently accepted Terms version in your browser's local/i);
  assert.match(html, /server-generated acceptance time/i);
});

test("map uses real cross streets in order with complete data attribution", async () => {
  const html = await readFile(new URL("src/App.jsx", root), "utf8");
  const model = await readFile(new URL("src/service-areas.generated.mjs", root), "utf8");
  const streets = ["Addison Street", "Allston Way", "Bancroft Way", "Channing Way", "Dwight Way"];

  for (const street of streets) {
    assert.match(model, new RegExp(street));
  }

  assert.match(html, /OpenFreeMap/);
  assert.match(html, /OpenMapTiles/);
  assert.match(html, /© OpenStreetMap contributors/);
  assert.ok(html.indexOf("© OpenStreetMap contributors") > html.indexOf("<footer>"));
  assert.match(html, /Community GIS Portal/);
  assert.match(model, /City of Berkeley Block Numbers/);
  assert.doesNotMatch(html, /hqnk-qfhq/);
  assert.match(html, /WestBerkeleyMap/);
  assert.doesNotMatch(html, />4 ranges live</);
  assert.match(html, /SERVICE_AREA_METADATA/);
  assert.match(html, /selected-report-total/);
  assert.match(html, /selected-stream-coverage/);
});

test("map has an accessible non-canvas range selector and honest coverage copy", async () => {
  const map = await readFile(new URL("src/WestBerkeleyMap.jsx", root), "utf8");
  assert.match(map, /Search supported ranges/);
  assert.match(map, /No live community range matches that search yet/);
  assert.match(map, /aria-pressed/);
  assert.match(map, /Map unavailable/);
  assert.match(map, /RESULT_PAGE_SIZE = 12/);
  assert.match(map, /Show more/);
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
  assert.match(
    css,
    /\.map-stage\s*>\s*\.map-canvas\s*\{[^}]*position:\s*absolute;[^}]*width:\s*100%;[^}]*height:\s*100%;/s,
  );
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
  assert.match(app, /Recent reports; holiday schedules may differ/);
  assert.match(app, /Add to calendar/);
  assert.match(app, /Available after community consensus/);
  assert.doesNotMatch(css, /body\s*\{[^}]*min-width:\s*320px/s);
});

test("street sweeping is side-aware, calendar-enabled, and safety qualified", async () => {
  const app = await readFile(new URL("src/App.jsx", root), "utf8");
  const model = await readFile(new URL("src/street-sweeping.mjs", root), "utf8");

  assert.match(app, /Official parking reminder/);
  assert.match(app, /Choose the side where you park/);
  assert.match(app, /Add reminder/);
  assert.match(app, /Move your car before the posted time to avoid a ticket/);
  assert.match(app, /No published residential schedule found/);
  assert.match(app, /Posted signs control/);
  assert.match(model, /Odd addresses/);
  assert.match(model, /Even addresses/);
  assert.match(model, /optOutBlocks\.includes/);
});

test("reliance actions require a conspicuous Terms acknowledgement", async () => {
  const app = await readFile(new URL("src/App.jsx", root), "utf8");
  const terms = await readFile(new URL("terms.html", root), "utf8");

  assert.match(app, /Verify before you rely on a schedule/);
  assert.match(app, /I understand and agree to the/);
  assert.match(app, /tickets, towing, and missed collections/);
  assert.match(app, /disabled=\{submitting \|\| !termsAccepted\}/);
  assert.match(app, /disabled=\{!termsAccepted\}/);
  assert.match(terms, /Posted parking signs control/i);
  assert.match(terms, /parking tickets, citations, towing or storage charges, missed collections/i);
  assert.match(terms, /fullest extent\s+permitted by law/i);
  assert.match(terms, /do not exclude liability or waive a right that cannot lawfully be\s+excluded/i);
});
