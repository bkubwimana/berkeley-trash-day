export const TERMS_VERSION = "2026-09-15";
export const TERMS_ACCEPTANCE_STORAGE_KEY = "berkeley-trash-day:accepted-terms-version";

export function readTermsAcceptance(storage) {
  try {
    const target = storage ?? globalThis.localStorage;
    return target?.getItem(TERMS_ACCEPTANCE_STORAGE_KEY) === TERMS_VERSION;
  } catch {
    return false;
  }
}

export function writeTermsAcceptance(accepted, storage) {
  try {
    const target = storage ?? globalThis.localStorage;
    if (accepted) target?.setItem(TERMS_ACCEPTANCE_STORAGE_KEY, TERMS_VERSION);
    else target?.removeItem(TERMS_ACCEPTANCE_STORAGE_KEY);
  } catch {
    // Storage can be unavailable in privacy modes; current-page state still works.
  }
}
