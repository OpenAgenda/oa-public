// Minimal PATH resolver — returns the absolute path of an executable, or null.
//
// Its one caller is the deno engine (`which('deno')`): resolving the binary up
// front lets us surface a clear "install deno / use OA_EXECUTOR=node" message
// instead of a cryptic spawn ENOENT. The node engine uses process.execPath and
// never needs this.
//
// POSIX-only by design: it uses the platform PATH delimiter but does NOT do
// Windows PATHEXT (.exe/.cmd) resolution, and X_OK is meaningless on Windows.
// That is fine — the deno/srt hardened path targets Linux/macOS only (srt does
// not run on Windows), and the node engine, which works anywhere, bypasses this.

import { accessSync, existsSync, constants } from 'node:fs';
import { isAbsolute, join, delimiter } from 'node:path';

export function which(bin) {
  if (isAbsolute(bin)) return existsSync(bin) ? bin : null;
  const dirs = (process.env.PATH ?? '').split(delimiter).filter(Boolean);
  for (const dir of dirs) {
    const full = join(dir, bin);
    try {
      accessSync(full, constants.X_OK);
      return full;
    } catch {
      // not here — keep looking
    }
  }
  return null;
}

/** @returns {import('./executor.js').ExecResult} */
export function missingBinResult(bin, hint) {
  return {
    stdout: '',
    stderr: `${bin} not found on PATH. ${hint}`,
    timedOut: false,
    exitCode: null,
  };
}
