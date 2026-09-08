import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);

test("tracker labels provenance and provides official Berkeley information", async () => {
  const html = await readFile(new URL("public/index.html", root), "utf8");
  assert.match(html, /Community beta/);
  assert.match(html, /Unofficial/);
  assert.match(html, /Not affiliated with the City of Berkeley/);
  assert.match(html, /\(510\) 981-7270/);
  assert.match(html, /berkeleyca\.gov\/city-services\/trash-recycling\/residential-waste-services/);
  assert.match(html, /Three agreeing reports/);
  assert.match(html, /Reports expire after 180 days/);
});

test("report form has no identity, exact-address, comment, photo, or location field", async () => {
  const html = await readFile(new URL("public/index.html", root), "utf8");
  for (const prohibited of ["name", "email", "phone", "address", "comment", "photo", "latitude", "longitude"]) {
    assert.doesNotMatch(html, new RegExp(`name=["']${prohibited}["']`, "i"));
  }
  assert.match(html, /name="block"/);
  assert.match(html, /name="stream"/);
  assert.match(html, /name="day"/);
  assert.match(html, /name="confirmed"/);
});

test("privacy page states collected and excluded data", async () => {
  const html = await readFile(new URL("public/privacy.html", root), "utf8");
  assert.match(html, /does not ask for your name, email, phone number, account, exact/i);
  assert.match(html, /hosting provider may temporarily process standard connection data/i);
  assert.match(html, /Reports contribute to the schedule for 180 days/i);
  assert.match(html, /does not\s+sell community-report data/i);
});
