// Per-caller concurrency cap for the HTTP transport's `execute` tool.
//
// The global concurrency cap (concurrencyLimit.js) bounds INSTANTANEOUS load
// process-wide so a burst can't OOM the host — but it is identity-blind: it only
// counts slots. With burst (rate-limit bucket) ≫ the global cap, ONE caller can
// momentarily grab every slot and starve everyone else with EXEC_BUSY. The
// per-caller rate limit (rateLimiter.js) bounds a caller's SUSTAINED call rate,
// not how many runs they hold AT ONCE. This module fills that gap: it caps how
// many runs a single caller may have in the execute pipeline at once, so no one
// tenant can occupy more than its share of the global slots (a fairness /
// noisy-neighbour guard, layered on top of the global resource-safety cap).
//
// "In the pipeline" = the slot is held from admission through the whole run,
// INCLUDING any time the run spends waiting in the global cap's queue (the slot
// wraps executor.run() in server.js, and the global limiter may park it). So
// under global saturation the cap counts submitted-and-queued runs, not only
// executing ones — deliberately: it stops a caller from stuffing the global
// queue with its own backlog, which is exactly the share-grab we're bounding.
//
// It lives at the server boundary (not the executor) because it needs the caller
// identity — the verified OAuth `sub` — which only the HTTP resource server has,
// exactly like rateLimiter.js. stdio has no caller identity (a single local
// user), so it runs without this guard.
//
// Reject, don't queue: this is a fairness cap, not a smoothing buffer. A caller
// already at its cap is refused fast with a RETRYABLE busy (same back-off
// vocabulary as the global cap and the rate limit) — the point is to LIMIT a
// caller's share, not let them build a private backlog that still competes for
// the shared budget. The global cap already provides the queue.
//
// Memory: state is in-memory and PER INSTANCE. The Map is bounded by callers
// with a run IN FLIGHT (a key is dropped the moment its count returns to 0), so
// it needs no sweep — unlike the token-bucket limiter, an idle caller holds no
// entry at all. For a horizontally-scaled deployment the cap would be N× per
// host; move to a shared store if that ever matters (out of scope while this
// runs single-instance).

import {
  recordConcurrencyRejected,
  recordCallerConcurrencyAtAdmission,
} from './metrics.js';

/**
 * @param {object} opts
 * @param {number} opts.maxPerCaller  max simultaneous runs per caller (≥1)
 * @returns {{
 *   tryAcquire: (key: string) => { acquired: boolean, release: () => void },
 *   inflightFor: (key: string) => number,
 *   size: number,
 * }}
 */
export function createCallerConcurrencyLimiter({ maxPerCaller }) {
  // Fail closed on an unusable config: a cap < 1 would refuse every caller
  // (permanent lockout). Unreachable via loadConfig (int() floors the knob > 0),
  // but assert the invariant for any other caller.
  if (!(maxPerCaller >= 1)) {
    throw new Error(
      `createCallerConcurrencyLimiter requires maxPerCaller >= 1 (got ${maxPerCaller})`,
    );
  }

  /** @type {Map<string, number>} in-flight count per caller key */
  const inflight = new Map();

  return {
    /**
     * Try to reserve one in-flight slot for `key`. On success returns an
     * `acquired: true` handle whose `release()` frees the slot (idempotent —
     * safe to call from a `finally` even if the run never started). On refusal
     * (caller already at the cap) returns `acquired: false` with a no-op
     * `release`, so the caller can always call it unconditionally.
     * @param {string} key  the caller identity (OAuth `sub`)
     */
    tryAcquire(key) {
      const n = inflight.get(key) ?? 0;
      if (n >= maxPerCaller) {
        // Emit the rejection metric here (the limiter owns it), mirroring how
        // concurrencyLimit.js reports the global cap's rejections — so the per-
        // caller cap has dashboard/alert parity (oa.mcp.concurrency.rejected with
        // reason=caller_cap) on top of the execute outcome=caller_busy counter.
        recordConcurrencyRejected('caller_cap');
        return { acquired: false, release: () => {} };
      }
      inflight.set(key, n + 1);
      // Lossless occupancy signal: how many runs this caller already held when
      // this one was admitted (0..cap-1). Recorded per admission because a sampled
      // gauge of live occupancy would miss these short-lived µVM spikes (metrics.js).
      recordCallerConcurrencyAtAdmission(n);
      let released = false;
      return {
        acquired: true,
        release: () => {
          if (released) return;
          released = true;
          const cur = inflight.get(key) ?? 0;
          // Drop the key at 0 so the Map only holds callers with a live run.
          if (cur <= 1) inflight.delete(key);
          else inflight.set(key, cur - 1);
        },
      };
    },

    /** Current in-flight count for a caller (0 if none). Exposed for tests. */
    inflightFor(key) {
      return inflight.get(key) ?? 0;
    },

    /** Number of callers with at least one run in flight. */
    get size() {
      return inflight.size;
    },
  };
}
