// Token-bucket rate limiter — pure unit tests with an injected clock (no
// wall-clock waits). Covers the burst allowance, time-based refill, the
// retry-after hint, per-key independence, the idle-bucket sweep (including the
// invariant that an actively-throttled bucket is NEVER dropped — that would
// reset, i.e. bypass, its limit), and the fail-closed config guard.

import { createRateLimiter } from '../src/rateLimiter.js';

// A controllable clock: `clock.v` is the current time in ms.
const makeClock = () => {
  const clock = { v: 0 };
  return { clock, now: () => clock.v };
};

// Track created limiters and stop their sweep timers after each test.
let made = [];
const mk = (opts) => {
  const rl = createRateLimiter(opts);
  made.push(rl);
  return rl;
};
afterEach(() => {
  made.forEach((rl) => rl.dispose());
  made = [];
});

describe('createRateLimiter', () => {
  it('allows a burst up to capacity, then refuses', () => {
    const { now } = makeClock();
    const rl = mk({ capacity: 3, refillPerSec: 1, now });
    expect(rl.check('u').allowed).toBe(true);
    expect(rl.check('u').allowed).toBe(true);
    expect(rl.check('u').allowed).toBe(true);
    expect(rl.check('u').allowed).toBe(false); // bucket empty
  });

  it('reports the time until the next token when refused', () => {
    const { now } = makeClock();
    const rl = mk({ capacity: 1, refillPerSec: 2, now });
    expect(rl.check('u').allowed).toBe(true); // drains the single token
    const verdict = rl.check('u');
    expect(verdict.allowed).toBe(false);
    expect(verdict.retryAfterMs).toBe(500); // one token at 2/s = 500 ms
  });

  it('refills over time at refillPerSec (capped at capacity)', () => {
    const { clock, now } = makeClock();
    const rl = mk({ capacity: 3, refillPerSec: 1, now });
    for (let i = 0; i < 3; i += 1) rl.check('u'); // drain
    expect(rl.check('u').allowed).toBe(false);

    clock.v = 2000; // +2 s → +2 tokens
    expect(rl.check('u').allowed).toBe(true);
    expect(rl.check('u').allowed).toBe(true);
    expect(rl.check('u').allowed).toBe(false); // only 2 had refilled

    clock.v = 1_000_000; // long idle → refill is capped at capacity (3), not unbounded
    expect(rl.check('u').allowed).toBe(true);
    expect(rl.check('u').allowed).toBe(true);
    expect(rl.check('u').allowed).toBe(true);
    expect(rl.check('u').allowed).toBe(false);
  });

  it('keys are independent', () => {
    const { now } = makeClock();
    const rl = mk({ capacity: 1, refillPerSec: 1, now });
    expect(rl.check('x').allowed).toBe(true);
    expect(rl.check('x').allowed).toBe(false);
    expect(rl.check('y').allowed).toBe(true); // y has its own bucket
  });

  it('sweep() drops fully-refilled (idle) buckets', () => {
    const { clock, now } = makeClock();
    const rl = mk({ capacity: 2, refillPerSec: 1, now });
    rl.check('a');
    rl.check('b');
    expect(rl.size).toBe(2);

    clock.v = 10_000; // a and b have refilled back to full
    rl.sweep();
    expect(rl.size).toBe(0); // both reclaimed
  });

  it('sweep() keeps an actively-throttled bucket (no limit bypass)', () => {
    const { clock, now } = makeClock();
    // Very slow refill so a drained bucket stays non-full across the test.
    const rl = mk({ capacity: 1, refillPerSec: 0.001, now });
    expect(rl.check('a').allowed).toBe(true); // a drained → throttled
    expect(rl.check('b').allowed).toBe(true); // b drained → throttled

    clock.v = 100; // negligible refill — a,b still ~empty
    rl.sweep();
    expect(rl.size).toBe(2); // neither evicted (both throttled)
    expect(rl.check('a').allowed).toBe(false); // a's limit intact, not reset
  });

  it('rejects an unusable config (capacity or refillPerSec ≤ 0)', () => {
    expect(() => createRateLimiter({ capacity: 0, refillPerSec: 1 })).toThrow(
      /capacity > 0/,
    );
    expect(() => createRateLimiter({ capacity: 1, refillPerSec: 0 })).toThrow(
      /refillPerSec > 0/,
    );
  });
});
