// Concurrency guardrail — a backend-agnostic decorator that caps how many runs
// execute simultaneously and queues the overflow, so a burst of `execute` calls
// can't spawn unbounded sandboxes and OOM the host (a µVM run costs ≈116 MiB —
// see docs/microsandbox.md → "Measured characteristics").
//
// WHY a decorator and not the server handler: the HTTP transport builds a fresh
// McpServer PER REQUEST but SHARES one executor (index.js → createHttpApp), so a
// per-handler semaphore would never see across requests. Wrapping the singleton
// executor is the only altitude where ONE limiter governs the whole process —
// stdio and HTTP alike. It also stays engine-agnostic: it only counts slots; the
// per-run RAM cost lives in the operator's OA_MAX_CONCURRENCY, not in this module
// (the engine-specific footprint is exactly why a RAM-derived default would have
// to know the engine and break this abstraction).

/** @typedef {import('./executor.js').SandboxExecutor} SandboxExecutor */

/**
 * A saturation/shutdown error — distinct from an execution failure: the run
 * never started, so it is RETRYABLE. server.js maps `code` to a clean client
 * message instead of the generic "Execution failed:" path.
 * @param {'EXEC_BUSY'|'EXEC_SHUTTING_DOWN'} code
 * @param {string} message
 */
function limiterError(code, message) {
  return Object.assign(new Error(message), { code });
}

/**
 * Wrap an executor so at most `maxConcurrency` runs are in flight at once.
 * Overflow waits in a bounded FIFO queue; a waiter not admitted within
 * `queueTimeoutMs` — or that arrives when the queue is already full — is
 * rejected with a retryable EXEC_BUSY error rather than piling up unbounded.
 *
 * @param {SandboxExecutor} executor  the engine to guard
 * @param {object} opts
 * @param {number} opts.maxConcurrency  max simultaneous runs (≥1)
 * @param {number} opts.maxQueue        max waiting runs before EXEC_BUSY (≥0)
 * @param {number} opts.queueTimeoutMs  max wait before EXEC_BUSY (>0)
 * @returns {SandboxExecutor}
 */
export function withConcurrencyLimit(
  executor,
  { maxConcurrency, maxQueue, queueTimeoutMs },
) {
  // `active` = slots currently held (admitted and not yet released). Single
  // thread, so no lock is needed — just keep this counter and the queue coherent.
  let active = 0;
  /**
   * @type {Array<{
   *   admit: () => void,
   *   reject: (e: Error) => void,
   *   timer: ReturnType<typeof setTimeout>,
   * }>}
   */
  const queue = [];
  let disposed = false;

  // Resolve when a slot is free: admit immediately if one is, else park in the
  // queue until release()/timeout/dispose. Rejects (never starts the run) when
  // the queue is full, the wait times out, or the server is shutting down. The
  // @returns annotation lets `resolve()` be called with no value (Promise<void>).
  /** @returns {Promise<void>} */
  const acquire = () =>
    new Promise((resolve, reject) => {
      if (disposed) {
        reject(limiterError('EXEC_SHUTTING_DOWN', 'Server is shutting down.'));
        return;
      }
      if (active < maxConcurrency) {
        active += 1;
        resolve();
        return;
      }
      if (queue.length >= maxQueue) {
        reject(
          limiterError(
            'EXEC_BUSY',
            `Server is at capacity (${maxConcurrency} running, ${maxQueue} queued).`,
          ),
        );
        return;
      }
      const waiter = {
        admit: () => {
          clearTimeout(waiter.timer);
          active += 1;
          resolve();
        },
        reject: (err) => {
          clearTimeout(waiter.timer);
          reject(err);
        },
        timer: setTimeout(() => {
          const i = queue.indexOf(waiter);
          if (i !== -1) queue.splice(i, 1);
          reject(
            limiterError(
              'EXEC_BUSY',
              `Timed out after ${queueTimeoutMs} ms waiting for a free slot.`,
            ),
          );
        }, queueTimeoutMs),
      };
      // Don't keep the event loop alive just for a queued waiter's timer.
      waiter.timer.unref?.();
      queue.push(waiter);
    });

  // Free a slot and hand it straight to the next waiter — `active` stays pinned
  // across the transfer (decrement then re-admit) so a fresh caller can't race
  // into the slot ahead of the queue.
  const release = () => {
    active -= 1;
    const next = queue.shift();
    if (next) next.admit();
  };

  return {
    name: `${executor.name}+limit(${maxConcurrency})`,
    run: async (req) => {
      await acquire();
      try {
        return await executor.run(req);
      } finally {
        release();
      }
    },
    // Reject anything still queued (it never started) before draining the
    // engine, so a shutdown doesn't leave callers hanging on a slot that will
    // never come, and index.js's shutdown can still await the engine's drain.
    dispose: async () => {
      disposed = true;
      while (queue.length) {
        const waiter = queue.shift();
        if (waiter) {
          waiter.reject(
            limiterError('EXEC_SHUTTING_DOWN', 'Server is shutting down.'),
          );
        }
      }
      await executor.dispose?.();
    },
  };
}
