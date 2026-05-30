// `srt` backend — the intended LOCAL hardened backend.
//
// srt (Anthropic sandbox-runtime, the sandbox Claude Code uses) wraps a command
// with OS-level guardrails: filesystem deny + a network egress allowlist
// enforced via an HTTP/SOCKS proxy (bubblewrap+seccomp on Linux, Seatbelt on
// macOS). It runs everywhere a dev is — Intel macs and no-virtualization hosts
// included — which is why it's the local backend rather than microsandbox.
//
// srt only SANDBOXES; it does not run JS. We run the JS inside it with **Node**
// (already present — no extra install). srt is NOT a transparent interceptor: it
// blocks raw sockets and advertises its proxy via HTTP_PROXY/HTTPS_PROXY, which
// the runtime must honor. Node's fetch honors them when NODE_USE_ENV_PROXY=1
// (Node >= 24), which we set via `env` so it survives srt's env handling. srt's
// allowedDomains is therefore the single egress authority.
//
// srt provides NO resource limits, so this adapter applies its own wall-clock
// kill (runProcess) and a V8 heap cap (--max-old-space-size).
//
// Requires `srt` on PATH (Node is process.execPath).

import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runProcess } from './_spawn.js';
import { which, missingBinResult } from './_which.js';

function writeSrtSettings(allowNet) {
  const dir = mkdtempSync(join(tmpdir(), 'oa-mcp-srt-'));
  const file = join(dir, 'srt-settings.json');
  // srt schema (see github.com/anthropic-experimental/sandbox-runtime):
  // egress allowed ONLY to the API host(s); writes use an allow-only model so an
  // empty allowWrite = no writes; reads rely on srt's mandatory denies for
  // secrets (an empty denyRead must not break the runtime reading its own libs).
  const settings = {
    network: {
      allowedDomains: allowNet, // wildcards supported, e.g. "*.openagenda.com"
      deniedDomains: [],
    },
    filesystem: {
      denyRead: [],
      allowRead: [],
      allowWrite: [], // allow-only → nothing writable
      denyWrite: [],
    },
  };
  writeFileSync(file, JSON.stringify(settings, null, 2));
  return file;
}

/** @returns {import('./executor.js').SandboxExecutor} */
export function createSrtExecutor() {
  return {
    name: 'srt',
    run: ({ code, allowNet, limits, tls }) => {
      const srt = which('srt');
      if (!srt) {
        return Promise.resolve(
          missingBinResult(
            'srt',
            'See https://github.com/anthropic-experimental/sandbox-runtime',
          ),
        );
      }
      const env = which('env') ?? '/usr/bin/env';
      const settingsPath = writeSrtSettings(allowNet);

      // `env` assignments injected right before node (survive srt's env handling).
      // NODE_USE_ENV_PROXY=1: honor srt's proxy on macOS (Linux srt is transparent).
      const envAssign = ['NODE_USE_ENV_PROXY=1'];
      if (tls?.extraCaCerts) envAssign.push(`NODE_EXTRA_CA_CERTS=${tls.extraCaCerts}`);

      const nodeFlags = [
        `--max-old-space-size=${limits.memoryMb}`,
        '--input-type=module',
      ];
      if (tls?.useSystemCa) nodeFlags.unshift('--use-system-ca'); // trust OS store (dev CA)

      // `srt --settings <file> -- env <assign...> node <flags...>`; code via stdin.
      return runProcess({
        cmd: srt,
        args: [
          '--settings',
          settingsPath,
          '--',
          env,
          ...envAssign,
          process.execPath,
          ...nodeFlags,
        ],
        input: code,
        timeoutMs: limits.timeoutMs, // srt has no timeout of its own — we enforce it
      });
    },
  };
}
