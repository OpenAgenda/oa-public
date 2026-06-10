// `node` engine — runs the JS with Node itself (already present, no install).
//
// Since Node 24 the (now stable) permission model gives the child a
// PROCESS-LEVEL sandbox: under `--permission`, filesystem, subprocess,
// worker_threads, native addons and WASI are all denied (ERR_ACCESS_DENIED).
// The program we run needs none of them — a self-contained text fed via stdin
// (see preamble.js) — so the engine applies it by default; OA_LOCAL_NO_SANDBOX=1
// is the explicit opt-out (`permission: false`, the bare-node path). Note the
// model does NOT gate `process.env`: the minimal env block (env.js) remains the
// defense against env leakage, same as for deno. NODE_EXTRA_CA_CERTS works
// under `--permission` without an fs grant (node core reads the CA file before
// permission gating — verified on 24.12).
//
// What the permission model does NOT give: an EGRESS boundary. Node 24 doesn't
// cover the network at all; Node 25 puts it behind a boolean `--allow-net` (no
// host scoping yet) that we must grant — the program's whole purpose is to call
// the API. So node still CANNOT be its own egress authority: `config.js`
// refuses `node + egress=executor`, and this engine only runs when an OUTER
// wrapper owns egress (OA_CODE_EGRESS_AUTHORITY=wrapper — launched under
// `srt -- node server.js`, whose jail this child inherits) or under `none`,
// where the executed code can reach ANY host, carrying the baked API credential
// — local, bounded-trust use only. Revisit when `--allow-net` learns host
// scoping (it is under active development upstream).
//
// It also applies the two caps Node can self-impose: the wall-clock kill
// (runProcess) and a V8 heap cap (--max-old-space-size). The runtime is
// process.execPath (this very Node), so there is no binary to locate — and
// process.versions.node tells us exactly which flags the child understands.

import { runProcess } from '../spawn.js';
import { sandboxEnv } from '../env.js';

// Major version of the node that will run the child (process.execPath — this
// very node, so the parent's version IS the child's).
const NODE_MAJOR = Number(process.versions.node.split('.')[0]);

/**
 * Build the node argv. Exported for tests. `nodeMajor` is injectable because
 * the flag set is version-dependent: `--permission` is stable from 24;
 * 25 moved the network behind it (boolean `--allow-net`, granted — see header).
 */
export function buildNodeFlags({
  limits,
  useSystemCa = false,
  permission = false,
  nodeMajor = NODE_MAJOR,
}) {
  return [
    ...useSystemCa ? ['--use-system-ca'] : [], // trust OS store (dev CA)
    ...permission
      ? ['--permission', ...nodeMajor >= 25 ? ['--allow-net'] : []]
      : [],
    `--max-old-space-size=${limits.memoryMb}`,
    '--input-type=module', // read the ESM program from stdin (no temp file)
  ];
}

/**
 * @param {{ permission?: boolean }} [opts]  `permission` applies Node's
 *   permission model to the child (config.nodePermission — on unless
 *   OA_LOCAL_NO_SANDBOX opted out).
 * @returns {import('../executor.js').SandboxExecutor}
 */
export function createNodeExecutor({ permission = false } = {}) {
  // FAIL CLOSED at boot, not per-run: an older node would reject --permission
  // ("bad option") on every execute, which would read as a code bug, not a
  // runtime mismatch. package.json declares engines.node >= 24 — this is the
  // runtime enforcement of the same floor.
  if (permission && NODE_MAJOR < 24) {
    throw new Error(
      `node ${process.versions.node} cannot apply the permission sandbox `
        + '(--permission is stable from Node 24). Upgrade node, use '
        + 'OA_EXECUTOR=deno, or explicitly accept the bare-node path with '
        + 'OA_LOCAL_NO_SANDBOX=1.',
    );
  }
  return {
    name: 'node',
    run: ({ code, limits, tls, env: reqEnv }) => {
      const nodeFlags = buildNodeFlags({
        limits,
        useSystemCa: tls?.useSystemCa,
        permission,
      });

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
        // executed code reads process.env (NOT gated by --permission), so this
        // keeps host secrets out of it.
        env: sandboxEnv({ ...reqEnv, ...extraEnv }),
      });
    },
  };
}
