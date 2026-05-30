// Assembles the program that runs inside the sandbox: a tiny `oa` client
// (built on the global `fetch` Deno provides) + the LLM-written body.
//
// The base URL and API key are BAKED INTO the program text rather than passed
// as env, so the sandbox needs no env access at all (deno runs with only
// --allow-net). In hosted mode the injected key is the CALLER's scoped token —
// the executed code therefore never exceeds the caller's own permissions.
//
// SECURITY BOUNDARY — read this before trusting the `oa.get` origin check below.
// The executed code is UNTRUSTED and runs in the same scope as the `oa` client:
// it can read `__cfg.apiKey` and call the global `fetch` directly. So no
// in-process JS check can be the exfiltration boundary. The ACTUAL boundary is
// the sandbox's network EGRESS ALLOWLIST (deno `--allow-net=<host>`, srt
// `allowedDomains`), scoped to the API host only — that is what stops the token
// from being sent anywhere else. The origin check in `oa.get` is a MISUSE guard
// (keep accidental/relative paths on the API host, fail loudly on an obvious
// cross-origin path); it is defense-in-depth, NOT the thing keeping the key in.

const CLIENT = `
const oa = (() => {
  const raw = __cfg.baseUrl;
  const base = new URL(raw.endsWith("/") ? raw : raw + "/");
  const headers = __cfg.apiKey ? { Authorization: "Bearer " + __cfg.apiKey } : {};
  async function get(path, query) {
    // MISUSE GUARD (not the security boundary — see the egress-allowlist note at
    // the top of this file). Resolve \`path\` against the API base and fail loudly
    // if it lands on another origin, so a mistaken/relative path stays on the API
    // host. Stripping the leading slash keeps relative paths under the base;
    // "//evil" / "@host" neutralize to same-origin path segments; an absolute
    // "https://evil" resolves cross-origin and is refused here. This catches
    // accidents and obvious smuggling, but the sandbox egress allowlist is what
    // actually prevents untrusted code from sending the token off-host.
    const url = new URL(String(path).replace(/^\\/+/, ""), base);
    if (url.origin !== base.origin) {
      throw new Error("oa: refusing cross-origin request (path must stay on " + base.origin + "): " + path);
    }
    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
      }
    }
    const res = await fetch(url, { headers });
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error("OpenAgenda API " + res.status + ": " + JSON.stringify(body));
    }
    return body;
  }
  return {
    get,
    listEvents: (agendaUid, params) => get("/agendas/" + agendaUid + "/events", params),
    getEvent: (agendaUid, eventUid) => get("/agendas/" + agendaUid + "/events/" + eventUid),
    getFacets: (agendaUid, params) => get("/agendas/" + agendaUid + "/events/facets", params),
  };
})();
`;

/**
 * @param {string} userCode  async body written by the caller; should `return` a value.
 * @param {{baseUrl:string, apiKey:string|null}} cfg
 * @returns {string} a self-contained program for the sandbox runtime.
 */
export function buildScript(userCode, cfg) {
  const head = `const __cfg = ${JSON.stringify({ baseUrl: cfg.baseUrl, apiKey: cfg.apiKey ?? null })};`;
  return [
    head,
    CLIENT,
    'const __run = async () => {',
    userCode,
    '};',
    'const __r = await __run();',
    'console.log(typeof __r === "string" ? __r : JSON.stringify(__r ?? null, null, 2));',
  ].join('\n');
}
