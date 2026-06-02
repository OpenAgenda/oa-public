// The pluggable execution engine.
//
// One narrow interface, several engines selected by config. ~95% of the MCP
// server (tools, docs, the `oa` client, result mapping) is shared; only the
// adapter that actually RUNS the code differs. This is what lets the same
// codebase ship a broadly-compatible local mode (node/deno) and a hard
// multi-tenant boundary (microsandbox) without duplication.
//
// CONTRACT — every engine MUST honor `limits` (the wall-clock kill + heap cap),
// even when the underlying runtime doesn't provide them natively. Egress is
// governed by `egressAuthority`: an engine owns egress only when it is `executor`
// (deno scopes --allow-net; the µVM its allowlist). Under `wrapper`/`none` the
// engine does not enforce egress — an outer sandbox does, or nobody does. An
// engine that silently ignores a promised cap is a security hole.

/**
 * @typedef {object} ExecRequest
 * @property {string} code        Full program to run (preamble + user code).
 * @property {Record<string,string>} env   Extra env for the runtime (usually empty;
 *                                          secrets are baked into `code`, not env,
 *                                          so the sandbox needs no env access).
 * @property {string[]} allowNet  Egress allowlist (hostnames) — applied by the
 *                                 engine only when it owns egress (`executor`).
 * @property {'executor'|'wrapper'|'none'} egressAuthority  Who owns the network
 *           boundary: the engine, an outer wrapper, or nobody. See config.js.
 * @property {{timeoutMs:number, memoryMb:number}} limits  Hard resource caps.
 * @property {{useSystemCa:boolean, extraCaCerts:string|null}} [tls]  Extra CA
 *           trust for the runtime (dev only; prod uses public CAs).
 */

/**
 * @typedef {object} ExecResult
 * @property {string} stdout
 * @property {string} stderr
 * @property {boolean} timedOut   true if killed by the wall-clock limit.
 * @property {boolean} [outputCapped]  true if killed for exceeding the output cap.
 * @property {number|null} exitCode
 */

/**
 * @typedef {object} SandboxExecutor
 * @property {string} name
 * @property {(req: ExecRequest) => Promise<ExecResult>} run
 * @property {() => Promise<void>} [dispose]  Release engine resources (e.g. drain a
 *           warm µVM pool) on server shutdown. Optional; absent on stateless engines.
 */

import { createNodeExecutor } from './executors/nodeExecutor.js';
import { createDenoExecutor } from './executors/denoExecutor.js';
import { createMicrosandboxExecutor } from './executors/microsandboxExecutor.js';

/**
 * @param {ReturnType<typeof import('../config.js').loadConfig>} config
 * @returns {SandboxExecutor}
 */
export function createExecutor(config) {
  switch (config.executor) {
    case 'node':
      return createNodeExecutor();
    case 'deno':
      return createDenoExecutor();
    case 'microsandbox':
      return createMicrosandboxExecutor({
        image: config.microsandboxImage,
        poolSize: config.microsandboxPoolSize,
        allowNet: config.allowNet,
        limits: config.limits,
      });
    default:
      throw new Error(`Unknown executor: ${config.executor}`);
  }
}
