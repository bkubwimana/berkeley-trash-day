import test from "node:test";
import assert from "node:assert/strict";
import {
  TERMS_ACCEPTANCE_STORAGE_KEY,
  TERMS_VERSION,
  readTermsAcceptance,
  writeTermsAcceptance
} from "../src/terms.mjs";

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
    values
  };
}

test("remembers only acceptance of the current Terms version", () => {
  const storage = memoryStorage();
  assert.equal(readTermsAcceptance(storage), false);
  writeTermsAcceptance(true, storage);
  assert.equal(storage.values.get(TERMS_ACCEPTANCE_STORAGE_KEY), TERMS_VERSION);
  assert.equal(readTermsAcceptance(storage), true);
  writeTermsAcceptance(false, storage);
  assert.equal(readTermsAcceptance(storage), false);
});

test("an older Terms version does not count as current acceptance", () => {
  const storage = memoryStorage({ [TERMS_ACCEPTANCE_STORAGE_KEY]: "2026-09-14" });
  assert.equal(readTermsAcceptance(storage), false);
});

test("unavailable browser storage fails closed without throwing", () => {
  const unavailable = {
    getItem() { throw new Error("blocked"); },
    setItem() { throw new Error("blocked"); },
    removeItem() { throw new Error("blocked"); }
  };
  assert.equal(readTermsAcceptance(unavailable), false);
  assert.doesNotThrow(() => writeTermsAcceptance(true, unavailable));
});
