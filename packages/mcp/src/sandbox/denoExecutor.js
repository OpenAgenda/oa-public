// `deno` backend — the execution ENGINE the other backends wrap.
//
// Deno is deny-by-default: granting only `--allow-net=<host>` leaves the code
// with NO filesystem, env, subprocess, FFI or system access. Combined with the
// wall-clock kill and a V8 heap cap, this already gives:
//   - "fetch douteux"      → blocked: only the API host is reachable.
//   - "boucle infinie"     → blocked: hard SIGKILL after timeoutMs.
//   - "traitement lourd"   → bounded: --max-old-space-size caps the V8 heap.
//
// What it does NOT give: kernel/host isolation. A Deno/V8 0-day would land on
// the host. So this backend is for LOCAL, bounded-trust use only — `config.js`
// fails closed and refuses it for the hosted, multi-tenant surface.

import { runProcess } from './_spawn.js';
import { which, missingBinResult } from './_which.js';
import { sandboxEnv } from './_env.js';

/**
 * Build the deno argv. `netFlag` is the full --allow-net flag: scoped to the
 * API host when deno is the egress authority (standalone), or unrestricted when
 * an outer sandbox (srt) owns egress and deno only needs to reach its proxy.
 */
export function buildDenoArgs(netFlag, limits, extraFlags = []) {
  return [
    'run',
    netFlag,
    '--no-prompt', // never block on a permission prompt — deny instead
    ...extraFlags,
    `--v8-flags=--max-old-space-size=${limits.memoryMb}`,
    '-', // read the program from stdin (no temp file on disk)
  ];
}

/** @returns {import('./executor.js').SandboxExecutor} */
export function createDenoExecutor() {
  return {
    name: 'deno',
    run: ({ code, allowNet, limits, tls, env: reqEnv }) => {
      const deno = which('deno');
      if (!deno) {
        return Promise.resolve(
          missingBinResult(
            'deno',
            'Install: https://deno.com (or use SANDBOX_BACKEND=srt).',
          ),
        );
      }
      // TLS trust (dev): deno has no --use-system-ca. A custom CA file goes via
      // --cert; the system store is selected with DENO_TLS_CA_STORE=system
      // (deno defaults to its bundled mozilla roots).
      const extra = tls?.extraCaCerts ? [`--cert=${tls.extraCaCerts}`] : [];
      // Minimal, explicit env (never inherit the operator's secrets — see
      // _env.js). deno denies the code env access anyway (no --allow-env), but
      // we keep the process env block clean as defense-in-depth.
      /** @type {Record<string,string>} */
      const caEnv = tls?.useSystemCa
        ? { DENO_TLS_CA_STORE: 'system,mozilla' }
        : {};
      const env = sandboxEnv({ ...reqEnv, ...caEnv });
      return runProcess({
        cmd: deno,
        // Standalone deno IS the egress boundary: restrict --allow-net to the
        // API host. Transparent — deno refuses connect() to anything else.
        args: buildDenoArgs(`--allow-net=${allowNet.join(',')}`, limits, extra),
        input: code,
        timeoutMs: limits.timeoutMs,
        env,
      });
    },
  };
}
