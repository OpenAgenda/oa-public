// Assembles the program that runs inside the sandbox: the generated OpenAgenda
// SDK (@openagenda/api-client, bundled with ky + zod inlined) + the LLM-written
// body. A ready-to-use `oa` client (an `OpenAgenda` instance) and the zod
// `schemas` namespace are exposed for the body to call directly.
//
// The sandbox runs an inline ESM program via stdin with NO node_modules, so the
// SDK can't be `import`ed there — instead `dist/sdk-bundle.js` is a single
// self-contained IIFE (built by tsdown, see ../../tsdown.config.ts) that we read
// once and prepend. It publishes everything on `globalThis.__OA_SDK__`. The
// bundle is a BUILD ARTIFACT (gitignored dist/); `yarn build` regenerates it and
// the start/test/smoke/prepack scripts rebuild it before running.
//
// The base URL and API key are BAKED INTO the program text rather than passed as
// env, so the sandbox needs no env access at all (deno runs with only
// --allow-net). A key (or OAuth token) is REQUIRED — the API answers 401 without
// one (there is no anonymous read). In hosted mode the injected key is the
// CALLER's scoped token — the executed code therefore never exceeds the caller's
// own permissions.
//
// SECURITY BOUNDARY. The executed code is UNTRUSTED and runs in the same scope
// as the SDK: it can read `__cfg.apiKey` and call the global `fetch` directly,
// so no in-process JS check can be the exfiltration boundary. The ACTUAL
// boundary is the sandbox's network EGRESS ALLOWLIST (deno `--allow-net=<host>`,
// srt `allowedDomains`), scoped to the API host only — that is what keeps the
// token from being sent anywhere else. The SDK builds every request from the
// configured `baseUrl`, so well-behaved calls stay on the API host; the egress
// allowlist is what enforces it for misbehaving ones.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Read the bundle once at module load (it's ~200 KiB; re-reading per call would
// be wasteful). Built artifact under dist/ — run `yarn build` if it's missing.
const SDK_BUNDLE = readFileSync(
  join(import.meta.dirname, '..', '..', 'dist', 'sdk-bundle.js'),
  'utf8',
);

// Configure the shared client (base URL + key + trace headers), then expose a
// ready `oa` instance and the zod `schemas` namespace. We never enumerate the SDK
// methods here: `oa` carries whatever the contract defines (oa.agendas.events.list,
// …) and grows with it. `auth` is the bearer key; without it the API returns 401.
// `headers` are the W3C trace-context (traceparent) injected host-side as request
// defaults, so the API calls this program makes join the MCP trace; absent when
// the MCP isn't traced. Like the rest of `__cfg` they are caller-overridable — see
// the SECURITY BOUNDARY note above; the trace header is observability, not a
// boundary.
const SETUP = `
__OA_SDK__.client.setConfig({ baseUrl: __cfg.baseUrl, auth: __cfg.apiKey ?? undefined, headers: __cfg.trace ?? undefined });
const oa = new __OA_SDK__.OpenAgenda();
const schemas = __OA_SDK__.schemas;
`;

/**
 * @param {string} userCode  async body written by the caller; should `return` a value.
 * @param {{baseUrl:string, apiKey:string|null, trace?:Record<string,string>}} cfg
 *   `trace` holds W3C trace-context headers (traceparent/baggage) propagating the
 *   active MCP span into the program's API calls; empty/absent when untraced.
 * @returns {string} a self-contained program for the sandbox runtime.
 */
export function buildScript(userCode, cfg) {
  const head = `const __cfg = ${JSON.stringify({ baseUrl: cfg.baseUrl, apiKey: cfg.apiKey ?? null, trace: cfg.trace ?? null })};`;
  return [
    head,
    SDK_BUNDLE,
    SETUP,
    'const __run = async () => {',
    userCode,
    '};',
    'const __r = await __run();',
    'console.log(typeof __r === "string" ? __r : JSON.stringify(__r ?? null, null, 2));',
  ].join('\n');
}
