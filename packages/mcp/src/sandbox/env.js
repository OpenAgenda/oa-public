// Build a MINIMAL, explicit environment for the sandboxed child.
//
// The child must NOT inherit the operator's shell env. The engine (node/deno)
// exposes `process.env` to the (untrusted) executed code — so any secret in the
// MCP host's environment (cloud creds, other API keys, and the baked-in
// OA_API_KEY) would be readable and exfiltratable. We pass only the operational
// vars a runtime needs to start, plus explicit `extra` assignments.
//
// The proxy vars are passed through so the `wrapper` egress model works: when
// the MCP runs under srt, srt advertises its egress proxy via HTTP_PROXY (macOS;
// Linux srt is a transparent filter and sets none). The child must honor it to
// reach the API — node via NODE_USE_ENV_PROXY (set by the node engine), deno
// natively. These are not secrets; when no wrapper is present they are unset and
// have no effect.
//
// This is an ALLOWLIST on purpose (deny-by-default). If an engine ever needs
// another operational var, add it here explicitly — never fall back to
// inheriting the full environment.

const PASS_THROUGH = [
  'PATH',
  'HOME',
  'TMPDIR',
  'LANG',
  'LC_ALL',
  'TERM',
  'DENO_DIR', // deno module/cache dir, when the operator sets it
  // Outer-wrapper egress proxy (srt on macOS). Honored by the child; no-op when
  // unset (no wrapper / transparent Linux srt). See header.
  'HTTP_PROXY',
  'HTTPS_PROXY',
  'NO_PROXY',
];

/**
 * @param {Record<string,string>} [extra]  Explicit assignments to add on top.
 * @param {NodeJS.ProcessEnv} [base]        Source env (defaults to process.env).
 * @returns {Record<string,string>}
 */
export function sandboxEnv(extra = {}, base = process.env) {
  const env = {};
  for (const key of PASS_THROUGH) {
    if (base[key] != null) env[key] = base[key];
  }
  return { ...env, ...extra };
}
