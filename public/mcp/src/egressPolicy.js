// Egress + filesystem policy emission — for the `wrapper` authority.
//
// When OA_CODE_EGRESS_AUTHORITY=wrapper, the boundary is enforced by an OUTER
// sandbox the operator launches the MCP under (srt is the reference impl). The
// app CANNOT verify that wrapper is configured correctly — but it CAN emit the
// exact policy the wrapper must apply, derived from the same OA_BASE_URL the
// server uses, so the two can never drift. `openagenda-mcp print-egress-policy`
// prints this; wrap with it verbatim (`srt --settings <file> -- node …`).
//
// Two boundaries matter, not just the network:
//   - Network: srt is allow-only (deny-by-default) — we allow ONLY the API host.
//   - Filesystem READ: srt allows reads EVERYWHERE by default (deny-then-allow).
//     This matters because code-mode returns the executed code's value to the
//     caller — `return readFileSync('~/.ssh/id_rsa')` exfiltrates via the result
//     channel, BYPASSING the network allowlist. So we deny the home dir (where
//     secrets live: ~/.ssh, ~/.aws, .env…) and re-allow only the workspace and
//     the runtime install root. System paths (/usr, /lib) stay readable.

import { createHash } from 'node:crypto';
import { dirname } from 'node:path';

/**
 * The default filesystem read policy for the srt wrapper. Follows srt's
 * deny-then-allow read model (`allowRead` takes precedence over `denyRead`).
 * @param {{execPath?:string}} [opts]
 */
export function defaultReadPolicy({ execPath = process.execPath } = {}) {
  // The runtime install root (e.g. ~/.nvm/versions/node/vX): node/deno must read
  // their own libs there, and it can live under the denied home dir.
  const runtimeRoot = dirname(dirname(execPath));
  return {
    // `~` expands to the home dir in srt; `.` is the workspace (cwd at launch).
    denyRead: ['~'],
    allowRead: ['.', runtimeRoot],
  };
}

/**
 * @typedef {object} EgressPolicy
 * @property {string[]} allowNet         Network egress allowlist (hostnames).
 * @property {string[]} [denyRead]       Read-denied paths (srt deny-then-allow).
 * @property {string[]} [allowRead]      Read paths re-allowed within denied regions.
 */

// srt settings object (github.com/anthropic-experimental/sandbox-runtime):
//   - network: allow-only → ONLY the API host is reachable.
//   - filesystem read: deny-then-allow → deny home, re-allow workspace+runtime.
//   - filesystem write: allow-only → empty allowWrite = nothing writable.
/** @param {EgressPolicy} policy */
export function buildSrtSettings({ allowNet, denyRead = [], allowRead = [] }) {
  return {
    network: {
      allowedDomains: allowNet, // wildcards supported, e.g. "*.openagenda.com"
      deniedDomains: [],
    },
    filesystem: {
      denyRead,
      allowRead,
      allowWrite: [], // allow-only → nothing writable
      denyWrite: [],
    },
  };
}

// A stable fingerprint of the policy, so an operator can confirm the wrapper is
// enforcing what the app expects (compare the two hashes).
/** @param {EgressPolicy} policy */
export function policySha256({ allowNet, denyRead = [], allowRead = [] }) {
  return createHash('sha256')
    .update(JSON.stringify({ allowNet, denyRead, allowRead }))
    .digest('hex');
}

/**
 * Render the egress + fs policy in the requested format.
 *   - `srt`:  a ready-to-use srt --settings file (pure, redirectable to disk).
 *   - `json`: a wrapper-agnostic summary + fingerprint.
 * @param {{allowNet:string[], format:'srt'|'json'}} opts
 * @returns {string}
 */
export function renderEgressPolicy({ allowNet, format }) {
  const { denyRead, allowRead } = defaultReadPolicy();
  const policy = { allowNet, denyRead, allowRead };
  if (format === 'srt') return JSON.stringify(buildSrtSettings(policy), null, 2);
  return JSON.stringify(
    { ...policy, policySha256: policySha256(policy) },
    null,
    2,
  );
}
