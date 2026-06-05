// A pool of PRE-WARMED, SINGLE-USE µVMs.
//
// The µVM `create` step is ~74% of a run's latency (see docs/microsandbox.md →
// "Measured characteristics").
// This pool pays it ahead of time: it keeps `size` spares already created, so an
// acquire on a hit returns instantly and the run pays only `exec`.
//
// SECURITY INVARIANT — a spare is handed out ONCE and destroyed by the caller
// afterwards; it is NEVER reused across executions. A µVM carries a fixed egress
// policy and may hold in-guest state from prior code, so reuse would both leak
// state and risk applying the wrong network boundary. The pool therefore only
// holds spares that have NOT yet run anything, and the caller (the executor) is
// responsible for one-use-then-destroy.
//
// LIFETIME INVARIANT (no buggy window) — a µVM has a hard lifetime (its
// maxDuration, baked at create), and that clock ticks while the spare sits idle.
// To NEVER hand out a spare that could expire mid-run, acquire() serves a spare
// only while its REMAINING life safely exceeds a full run; an older spare is
// destroyed and replaced by a fresh inline create. `maxAgeMs` is that cutoff
// (= lifetime − a margin covering one run + slack). Under light traffic spares
// age past it and acquire degrades to a miss (slower) — never to a dead µVM.
// `bornAt` is stamped BEFORE create() resolves, so our age over-estimates the
// µVM's real age: we retire a spare slightly early, never too late.
//
// Pure logic: `create`/`destroy`/`now` are injected, so this is unit-tested with
// fakes and a fake clock, no KVM required.

/**
 * @param {object} opts
 * @param {number} opts.size                     Warm spares to keep ready.
 * @param {() => Promise<any>} opts.create        Boot a fresh spare.
 * @param {(spare:any) => any} opts.destroy       Tear a spare down (best-effort).
 * @param {(err:unknown) => void} [opts.onError]  Notified of background refill failures.
 * @param {number} [opts.maxAgeMs]                Max spare age before acquire retires it (default: ∞).
 * @param {() => number} [opts.now]               Clock (ms); injectable for tests (default: Date.now).
 */
export function createWarmPool({
  size,
  create,
  destroy,
  onError,
  maxAgeMs = Infinity,
  now = () => Date.now(),
}) {
  /** @type {{spare: any, bornAt: number}[]} idle, never-used warm spares */
  const idle = [];
  /** @type {Set<Promise<void>>} in-flight background creates, so drain() can await them */
  const inflight = new Set();
  let creating = 0; // in-flight background creates (so we don't over-warm)
  let draining = false;
  const stats = { hits: 0, misses: 0, created: 0, failed: 0, expired: 0 };

  // Boot one spare in the background (hoisted out of refill's loop so its async
  // callbacks don't close over loop state). bornAt is stamped NOW (before create
  // resolves) so the recorded age is a conservative over-estimate of the µVM's.
  function spawnOne() {
    creating += 1;
    const bornAt = now();
    const p = Promise.resolve()
      .then(create)
      .then(async (spare) => {
        stats.created += 1;
        // If we started draining mid-create, don't stash it — tear it down. We
        // AWAIT the destroy so drain() (which awaits `inflight`) can't return —
        // and let the process exit — before this µVM is actually released.
        if (draining) await Promise.resolve(destroy(spare)).catch(() => {});
        else idle.push({ spare, bornAt });
      })
      .catch((err) => {
        stats.failed += 1;
        onError?.(err);
      })
      .finally(() => {
        creating -= 1;
        inflight.delete(p);
      });
    inflight.add(p);
  }

  // Top idle back up to `size`, accounting for in-flight creates. Fire-and-forget:
  // callers never await it, so an acquire on a hit returns without blocking.
  function refill() {
    if (draining) return;
    while (idle.length + creating < size) spawnOne();
  }

  // Get a spare. Serve the first idle spare with enough REMAINING life to outlast a
  // full run (age ≤ maxAgeMs); retire any that aged out (destroy, count, skip). If
  // none qualifies, miss → create inline (a fresh µVM has full life). Either way,
  // kick a background refill so the next call is more likely a hit.
  async function acquire() {
    while (idle.length) {
      const entry = idle.shift();
      if (!entry) break;
      if (now() - entry.bornAt <= maxAgeMs) {
        stats.hits += 1;
        refill();
        return entry.spare;
      }
      // Aged out: it could expire mid-run. Drop it (best-effort) and try the next.
      stats.expired += 1;
      Promise.resolve(destroy(entry.spare)).catch(() => {});
    }
    stats.misses += 1;
    const spare = await create();
    stats.created += 1;
    refill();
    return spare;
  }

  // Destroy all idle spares and stop refilling (server shutdown). Await BOTH the
  // already-idle spares AND any creates still in flight: a spare that finishes
  // booting after drain() self-destroys (the `draining` check in spawnOne), and
  // we must wait for that teardown so a process.exit(0) right after drain() can't
  // orphan a just-booted µVM. `inflight` promises never reject (errors are caught
  // inside spawnOne), so Promise.all stays safe.
  async function drain() {
    draining = true;
    const spares = idle.splice(0);
    await Promise.all([
      ...spares.map((e) => Promise.resolve(destroy(e.spare)).catch(() => {})),
      ...inflight,
    ]);
  }

  return {
    acquire,
    refill,
    drain,
    stats,
    get idleCount() {
      return idle.length;
    },
  };
}
