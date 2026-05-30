// Shared child-process runner with a HARD wall-clock kill and output cap.
//
// This is the part of resource-limiting that does NOT come from the sandbox
// tool: a wall-clock SIGKILL is what stops infinite loops / hangs, and the
// output cap stops a runaway from filling memory via stdout. Both the deno and
// srt adapters rely on it (srt has no native limits at all).
//
// We spawn in a NEW PROCESS GROUP (detached) and kill the whole group, not just
// the direct child. The srt backend runs the JS as a grandchild (srt → env →
// node); signalling only the immediate child would orphan the runtime, which
// could outlive the wall-clock limit and keep holding egress. Killing the group
// (process.kill(-pid)) takes the whole tree down.

import { spawn } from 'node:child_process';

const MAX_OUTPUT_BYTES = 1024 * 1024; // 1 MiB — beyond this we assume runaway output.

/**
 * @param {object} opts
 * @param {string} opts.cmd
 * @param {string[]} opts.args
 * @param {string} opts.input        Written to the child's stdin, then closed.
 * @param {number} opts.timeoutMs
 * @param {Record<string,string>} [opts.env]  Child env; defaults to process.env.
 * @returns {Promise<import('./executor.js').ExecResult>}
 */
export function runProcess({ cmd, args, input, timeoutMs, env }) {
  return new Promise((resolve) => {
    let child;
    try {
      // detached:true → child becomes the leader of a new process group, so we
      // can later signal the whole group (negative pid) and reach grandchildren.
      child = spawn(cmd, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        env,
        detached: true,
      });
    } catch (err) {
      resolve({
        stdout: '',
        stderr: String(err?.message ?? err),
        timedOut: false,
        exitCode: null,
      });
      return;
    }

    let stdout = '';
    let stderr = '';
    let timedOut = false;
    let outputCapped = false;
    let settled = false;

    // Kill the child's entire process group (negative pid), falling back to the
    // direct child if the group signal fails (e.g. the child already exited, or
    // it never became a group leader). Best-effort: errors are swallowed.
    const killTree = () => {
      try {
        process.kill(-child.pid, 'SIGKILL');
      } catch {
        try {
          child.kill('SIGKILL');
        } catch {
          // already gone
        }
      }
    };

    const timer = setTimeout(() => {
      timedOut = true;
      killTree();
    }, timeoutMs);

    const finish = (exitCode) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ stdout, stderr, timedOut, outputCapped, exitCode });
    };

    child.stdout.on('data', (d) => {
      stdout += d;
      if (stdout.length > MAX_OUTPUT_BYTES) {
        if (!outputCapped) {
          outputCapped = true;
          stderr += '\n[killed: output exceeded 1 MiB]';
        }
        killTree();
      }
    });
    child.stderr.on('data', (d) => {
      stderr += d;
      if (stderr.length > MAX_OUTPUT_BYTES) {
        outputCapped = true;
        killTree();
      }
    });

    child.on('error', (err) => {
      stderr += `\n${err?.message ?? err}`;
      finish(null);
    });
    child.on('close', (code) => finish(code));

    child.stdin.on('error', () => {}); // ignore EPIPE if the child died early
    child.stdin.end(input);
  });
}
