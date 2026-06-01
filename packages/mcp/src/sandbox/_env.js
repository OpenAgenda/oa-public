// Build a MINIMAL, explicit environment for the sandboxed child.
//
// The child must NOT inherit the operator's shell env. Under srt the runtime is
// Node, which exposes `process.env` to the (untrusted) executed code — so any
// secret in the MCP host's environment (cloud creds, other API keys, and the
// baked-in OA_API_KEY) would be readable and exfiltratable. We pass only the
// operational vars a runtime needs to start, plus explicit `extra` assignments.
//
// Egress still works: on Linux srt is a transparent network filter (no proxy
// env needed); on macOS srt injects its proxy into the sandboxed process itself,
// and NODE_USE_ENV_PROXY (added by the srt adapter) makes Node honor it — none
// of that depends on the operator's environment leaking through here.
//
// This is an ALLOWLIST on purpose (deny-by-default). If a backend ever needs
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
