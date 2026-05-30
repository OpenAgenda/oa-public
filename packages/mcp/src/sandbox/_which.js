// Minimal PATH resolver — returns the absolute path of an executable, or null.
//
// We pass absolute binary paths to spawn so a reduced PATH inside the srt
// subprocess can't turn a present binary into a cryptic "command not found"
// (exit 127). It also lets us surface a clear "install X" message up front.

import { accessSync, existsSync, constants } from 'node:fs';
import { isAbsolute, join } from 'node:path';

export function which(bin) {
  if (isAbsolute(bin)) return existsSync(bin) ? bin : null;
  const dirs = (process.env.PATH ?? '').split(':').filter(Boolean);
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
