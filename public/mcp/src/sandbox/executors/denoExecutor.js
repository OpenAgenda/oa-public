// `deno` engine — the self-contained local sandbox.
//
// Deno is deny-by-default: granting only `--allow-net=<host>` leaves the code
// with NO filesystem, env, subprocess, FFI or system access. Combined with the
// wall-clock kill and a V8 heap cap, this already gives:
//   - "fetch douteux"      → blocked: only the API host is reachable.
//   - "boucle infinie"     → blocked: hard SIGKILL after timeoutMs.
//   - "traitement lourd"   → bounded: --max-old-space-size caps the V8 heap.
//
// Unlike node, deno CAN be its own egress authority (scoped `--allow-net`), so
// it is the recommended local default with OA_CODE_EGRESS_AUTHORITY=executor.
// Under a `wrapper` it runs permissive instead (the wrapper owns egress; deno
// must reach its proxy — see buildDenoArgs).
//
// What it does NOT give: kernel/host isolation. A Deno/V8 0-day would land on
// the host. So this engine is for LOCAL, bounded-trust use only — `config.js`
// fails closed and refuses it for the hosted, multi-tenant surface.

import { runProcess } from '../spawn.js';
import { which, missingBinResult } from '../which.js';
import { sandboxEnv } from '../env.js';

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

/** @returns {import('../executor.js').SandboxExecutor} */
export function createDenoExecutor() {
  return {
    name: 'deno',
    run: ({ code, allowNet, limits, tls, env: reqEnv, egressAuthority }) => {
      const deno = which('deno');
      if (!deno) {
        return Promise.resolve(
          missingBinResult(
            'deno',
            'The local default uses deno because it enforces fs/env/network '
              + 'permissions by default. Install deno (https://deno.com), or run '
              + 'with OA_LOCAL_NO_SANDBOX=1 for the unsafe local node engine (no '
              + 'filesystem/network boundary).',
          ),
        );
      }
      // TLS trust (dev): deno has no --use-system-ca. A custom CA file goes via
      // --cert; the system store is selected with DENO_TLS_CA_STORE=system
      // (deno defaults to its bundled mozilla roots).
      const extra = tls?.extraCaCerts ? [`--cert=${tls.extraCaCerts}`] : [];
      // Minimal, explicit env (never inherit the operator's secrets — see
      // env.js). deno denies the code env access anyway (no --allow-env), but
      // we keep the process env block clean as defense-in-depth.
      /** @type {Record<string,string>} */
      const caEnv = tls?.useSystemCa
        ? { DENO_TLS_CA_STORE: 'system,mozilla' }
        : {};
      const env = sandboxEnv({ ...reqEnv, ...caEnv });
      // Pick the egress mode. When deno owns egress (`executor`): scope
      // --allow-net to the API host — transparent, deno refuses connect()
      // elsewhere. When a `wrapper` (or `none`) owns it: run permissive — deno
      // must NOT also scope --allow-net or it would block the wrapper's own proxy
      // (macOS); the outer sandbox is the boundary. (config.js never lets node
      // reach here as its own authority, but deno can be either.)
      const netFlag = egressAuthority === 'executor'
        ? `--allow-net=${allowNet.join(',')}`
        : '--allow-net';
      return runProcess({
        cmd: deno,
        args: buildDenoArgs(netFlag, limits, extra),
        input: code,
        timeoutMs: limits.timeoutMs,
        env,
      });
    },
  };
}
