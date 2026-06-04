// Per-caller token-bucket rate limiter for the HTTP transport's `execute` tool.
//
// The concurrency cap (concurrencyLimit.js) bounds INSTANTANEOUS load globally;
// this bounds SUSTAINED load PER CALLER, so one caller can't monopolise the
// shared execution budget over time. It lives at the server boundary (not the
// executor) because it needs the caller identity — the verified OAuth `sub` —
// which only the HTTP resource server has. stdio has no caller identity (a
// single local user), so it runs without a limiter.
//
// Token bucket: each caller gets a bucket of `capacity` tokens that refills at
// `refillPerSec`. An `execute` consumes one; an empty bucket is refused with the
// time until the next token. This allows a natural burst (an agent firing a few
// calls in one reasoning step) while capping the long-run rate.
//
// Memory: state is in-memory and PER INSTANCE. A periodic sweep (every
// `sweepMs`, on an unref'd timer) drops FULLY-REFILLED (idle) buckets — they
// hold no live state, so dropping them changes no caller's budget — bounding the
// Map to the callers active within a sweep window rather than letting it grow
// for the process lifetime. An actively throttled (non-full) bucket is never
// dropped: evicting it would hand its owner a fresh full bucket and bypass the
// limit. `check()` itself stays O(1) (no prune on the hot path). For a
// horizontally-scaled, multi-instance deployment the per-caller limit would be
// N× — move to a shared store with native TTL (the `{check}` consumption seam
// makes that a drop-in); out of scope while this runs single-instance.

const DEFAULT_SWEEP_MS = 60_000;

/**
 * @param {object} opts
 * @param {number} opts.capacity      bucket size = max burst (tokens)
 * @param {number} opts.refillPerSec  sustained refill rate (tokens per second)
 * @param {() => number} [opts.now]   injectable clock in ms (defaults to Date.now)
 * @param {number} [opts.sweepMs]     idle-bucket sweep interval (default 60s)
 * @returns {{
 *   check: (key: string) => { allowed: boolean, retryAfterMs: number },
 *   sweep: () => void,
 *   dispose: () => void,
 *   size: number,
 * }}
 */
export function createRateLimiter({
  capacity,
  refillPerSec,
  now = Date.now,
  sweepMs = DEFAULT_SWEEP_MS,
}) {
  // Fail closed on an unusable config: refillPerSec <= 0 would make a drained
  // bucket never refill (permanent lockout) and the retry-after divide blow up
  // to Infinity. Unreachable via loadConfig (int() floors the knobs > 0), but
  // assert the invariant for any other caller.
  if (!(capacity > 0) || !(refillPerSec > 0)) {
    throw new Error(
      'createRateLimiter requires capacity > 0 and refillPerSec > 0 (got '
        + `capacity=${capacity}, refillPerSec=${refillPerSec})`,
    );
  }

  /** @type {Map<string, { tokens: number, last: number }>} */
  const buckets = new Map();

  /** @param {{ tokens: number, last: number }} b @param {number} t */
  const refill = (b, t) => {
    const elapsedSec = Math.max(0, t - b.last) / 1000;
    b.tokens = Math.min(capacity, b.tokens + elapsedSec * refillPerSec);
    b.last = t;
  };

  // Drop buckets that have refilled to full — they hold no live state, so this
  // frees memory without affecting any caller's budget. Throttled (non-full)
  // buckets are kept: evicting one would hand its owner a fresh full bucket and
  // defeat the limit. Runs on a timer (below), not on the hot path.
  const sweep = () => {
    const t = now();
    for (const [key, b] of buckets) {
      refill(b, t);
      if (b.tokens >= capacity) buckets.delete(key);
    }
  };

  // Periodic so the Map is bounded by callers active within a window rather than
  // growing for the process lifetime. unref so it never keeps Node alive.
  const timer = setInterval(sweep, sweepMs);
  timer.unref?.();

  return {
    /**
     * Try to consume one token for `key`.
     * @param {string} key  the caller identity (OAuth `sub`)
     * @returns {{ allowed: boolean, retryAfterMs: number }}
     */
    check(key) {
      const t = now();
      let b = buckets.get(key);
      if (!b) {
        b = { tokens: capacity, last: t };
        buckets.set(key, b);
      } else {
        refill(b, t);
      }
      if (b.tokens >= 1) {
        b.tokens -= 1;
        return { allowed: true, retryAfterMs: 0 };
      }
      // Time until the bucket holds one whole token again.
      const retryAfterMs = Math.ceil(((1 - b.tokens) / refillPerSec) * 1000);
      return { allowed: false, retryAfterMs };
    },

    // Force an idle-bucket sweep now (the timer does this periodically; exposed
    // for deterministic tests with an injected clock).
    sweep,

    // Stop the sweep timer (graceful shutdown / test cleanup). The timer is
    // unref'd, so this is optional for process exit but keeps tests tidy.
    dispose() {
      clearInterval(timer);
      buckets.clear();
    },

    get size() {
      return buckets.size;
    },
  };
}
