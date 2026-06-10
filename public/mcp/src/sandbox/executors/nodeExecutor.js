// `node` engine — runs the JS with Node itself (already present, no install).
//
// Node has NO intrinsic network/filesystem boundary: its permission model
// (Node 24: --permission, --allow-fs-*, --allow-child-process, --allow-worker)
// has no network permission, so node CANNOT be its own egress authority.
// `config.js` refuses `node + egress=executor`, so this engine only ever runs
// when an OUTER wrapper owns egress (OA_CODE_EGRESS_AUTHORITY=wrapper — launched
// under `srt -- node server.js`, whose jail this child inherits) or in explicit
// trusted-local mode (=none, no boundary at all). This adapter therefore does
// not — and cannot — enforce egress itself.
//
// It still applies the two caps Node CAN self-impose: the wall-clock kill
// (runProcess) and a V8 heap cap (--max-old-space-size). The runtime is
// process.execPath (this very Node), so there is no binary to locate.

import { runProcess } from '../spawn.js';
import { sandboxEnv } from '../env.js';

/** @returns {import('../executor.js').SandboxExecutor} */
export function createNodeExecutor() {
  return {
    name: 'node',
    run: ({ code, limits, tls, env: reqEnv }) => {
      const nodeFlags = [
        `--max-old-space-size=${limits.memoryMb}`,
        '--input-type=module', // read the ESM program from stdin (no temp file)
      ];
      if (tls?.useSystemCa) nodeFlags.unshift('--use-system-ca'); // trust OS store (dev CA)

      // NODE_USE_ENV_PROXY=1 (Node ≥ 24): IF an outer wrapper advertises a proxy
      // (srt on macOS), Node's fetch honors it. Harmless when no proxy is set
      // (Linux srt is transparent; egress=none has no proxy). The wrapper's proxy
      // vars reach the child via sandboxEnv's pass-through (see env.js).
      /** @type {Record<string,string>} */
      const extraEnv = { NODE_USE_ENV_PROXY: '1' };
      if (tls?.extraCaCerts) extraEnv.NODE_EXTRA_CA_CERTS = tls.extraCaCerts;

      return runProcess({
        cmd: process.execPath,
        args: nodeFlags,
        input: code,
        timeoutMs: limits.timeoutMs,
        // Minimal env (never inherit the operator's secrets — see env.js); the
        // executed code reads process.env, so this keeps host secrets out of it.
        env: sandboxEnv({ ...reqEnv, ...extraEnv }),
      });
    },
  };
}
