const API_SECURITY_HEADERS = Object.freeze({
  "Cache-Control": "no-store",
  "Content-Security-Policy": "default-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY"
});

export function jsonResponse(body, { status = 200, headers = {} } = {}) {
  return Response.json(body, {
    status,
    headers: { ...API_SECURITY_HEADERS, ...headers }
  });
}

export function rejectUnsafeWrite(request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!/^application\/json(?:\s*;|$)/i.test(contentType)) {
    return jsonResponse(
      { error: "Content-Type must be application/json." },
      { status: 415, headers: { Accept: "application/json" } }
    );
  }

  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && !["same-origin", "same-site", "none"].includes(fetchSite)) {
    return jsonResponse({ error: "Cross-site submissions are not accepted." }, { status: 403 });
  }

  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).origin !== new URL(request.url).origin) {
        return jsonResponse({ error: "Cross-site submissions are not accepted." }, { status: 403 });
      }
    } catch {
      return jsonResponse({ error: "Invalid request origin." }, { status: 403 });
    }
  }

  return null;
}

export function declaredBodyTooLarge(request, maximumBytes) {
  const value = request.headers.get("content-length");
  if (value === null) return false;
  const length = Number(value);
  return Number.isFinite(length) && length > maximumBytes;
}
