// The pluggable sandbox boundary.
//
// One narrow interface, several backends selected by config. ~95% of the MCP
// server (tools, docs, the `oa` client, result mapping) is shared; only the
// adapter that actually RUNS the code differs. This is what lets the same
// codebase ship a broadly-compatible local mode (srt) and a hard multi-tenant
// boundary (microsandbox) without duplication.
//
// CONTRACT — every backend MUST honor `allowNet` and `limits`, even when the
// underlying tool doesn't provide them natively. srt, for instance, has no
// resource limits, so its adapter applies an OS-level timeout itself. A backend
// that silently ignores a promised cap is a security hole, not a convenience.

/**
 * @typedef {object} ExecRequest
 * @property {string} code        Full program to run (preamble + user code).
 * @property {Record<string,string>} env   Extra env for the runtime (usually empty;
 *                                          secrets are baked into `code`, not env,
 *                                          so the sandbox needs no env access).
 * @property {string[]} allowNet  Egress allowlist (hostnames). Everything else denied.
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
 */

import { createDenoExecutor } from './denoExecutor.js';
import { createSrtExecutor } from './srtExecutor.js';
import { createMicrosandboxExecutor } from './microsandboxExecutor.js';

/**
 * @param {ReturnType<typeof import('../config.js').loadConfig>} config
 * @returns {SandboxExecutor}
 */
export function createExecutor(config) {
  switch (config.backend) {
    case 'deno':
      return createDenoExecutor();
    case 'srt':
      return createSrtExecutor();
    case 'microsandbox':
      return createMicrosandboxExecutor();
    default:
      throw new Error(`Unknown sandbox backend: ${config.backend}`);
  }
}
