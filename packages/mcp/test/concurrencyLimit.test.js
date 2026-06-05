import { withConcurrencyLimit } from '../src/sandbox/concurrencyLimit.js';

// A minimal ExecRequest — the fake engine ignores it; it only matters that the
// wrapper forwards SOMETHING to executor.run.
const REQ = {
  code: '',
  env: {},
  allowNet: [],
  egressAuthority: 'none',
  limits: { timeoutMs: 5000, memoryMb: 256 },
};

const okResult = () => ({
  stdout: 'ok',
  stderr: '',
  timedOut: false,
  exitCode: 0,
});

// Flush pending microtasks AND the macrotask queue so admit→run() chains settle.
const flush = () => new Promise((resolve) => setImmediate(resolve));

// A controllable engine: every run() blocks until we manually resolve it, so we
// can hold slots open and assert queueing/backpressure deterministically.
function deferredEngine(name = 'fake') {
  const pending = [];
  return {
    engine: {
      name,
      run: () => new Promise((resolve) => pending.push(resolve)),
    },
    // Number of runs the wrapper has actually STARTED (i.e. admitted past the cap).
    get started() {
      return pending.length;
    },
    resolveOne(value = okResult()) {
      const resolve = pending.shift();
      if (!resolve) throw new Error('no pending run to resolve');
      resolve(value);
    },
  };
}

describe('withConcurrencyLimit', () => {
  it('reflects the cap in the engine name', () => {
    const { engine } = deferredEngine('deno');
    const ex = withConcurrencyLimit(engine, {
      maxConcurrency: 3,
      maxQueue: 30,
      queueTimeoutMs: 1000,
    });
    expect(ex.name).toBe('deno+limit(3)');
  });

  it('admits up to maxConcurrency runs immediately and queues the rest', async () => {
    const fake = deferredEngine();
    const ex = withConcurrencyLimit(fake.engine, {
      maxConcurrency: 2,
      maxQueue: 10,
      queueTimeoutMs: 1000,
    });

    const p1 = ex.run(REQ);
    const p2 = ex.run(REQ);
    const p3 = ex.run(REQ);
    await flush();

    // Only 2 slots → exactly 2 runs started; the 3rd is parked in the queue.
    expect(fake.started).toBe(2);

    // Finishing one run frees its slot and admits the queued run.
    fake.resolveOne();
    await flush();
    expect(fake.started).toBe(2); // one finished, the queued one started

    fake.resolveOne();
    fake.resolveOne();
    await expect(Promise.all([p1, p2, p3])).resolves.toHaveLength(3);
  });

  it('rejects with EXEC_BUSY immediately when the queue is full', async () => {
    const fake = deferredEngine();
    const ex = withConcurrencyLimit(fake.engine, {
      maxConcurrency: 1,
      maxQueue: 1,
      queueTimeoutMs: 1000,
    });

    ex.run(REQ); // takes the only slot (never resolved)
    // Fills the 1-deep queue. Never awaited and its queue timer WILL fire later
    // in the suite → swallow the orphan EXEC_BUSY so it isn't an unhandled
    // rejection (the test only cares that the queue is full, not about this one).
    ex.run(REQ).catch(() => {});
    await flush();

    await expect(ex.run(REQ)).rejects.toMatchObject({ code: 'EXEC_BUSY' });
    expect(fake.started).toBe(1); // the rejected run never started
  });

  it('rejects a queued run with EXEC_BUSY after queueTimeoutMs', async () => {
    const fake = deferredEngine();
    const ex = withConcurrencyLimit(fake.engine, {
      maxConcurrency: 1,
      maxQueue: 5,
      queueTimeoutMs: 20,
    });

    ex.run(REQ); // holds the slot forever
    await flush();

    await expect(ex.run(REQ)).rejects.toMatchObject({ code: 'EXEC_BUSY' });
  });

  it('does not leak the slot to a run that already timed out in the queue', async () => {
    const fake = deferredEngine();
    const ex = withConcurrencyLimit(fake.engine, {
      maxConcurrency: 1,
      maxQueue: 5,
      queueTimeoutMs: 20,
    });

    ex.run(REQ); // slot 1, held (never resolved)
    const queued = ex.run(REQ); // waits, will time out and leave the queue
    await expect(queued).rejects.toMatchObject({ code: 'EXEC_BUSY' });

    // Free the held slot AFTER the queued run already gave up. The timed-out
    // waiter must have left the queue, so release() admits nothing here.
    fake.resolveOne();
    await flush();
    expect(fake.started).toBe(0); // nothing admitted from the now-empty queue

    // The discriminating check: prove the freed slot is genuinely available. A
    // fresh run must be admitted at once. If release() had instead admitted the
    // dead (timed-out) waiter, `active` would have leaked to 1 — permanently
    // shrinking capacity — and this run would queue instead of starting.
    ex.run(REQ);
    await flush();
    expect(fake.started).toBe(1);
  });

  it('dispose() rejects queued runs and forwards to the engine', async () => {
    let disposed = false;
    const engine = {
      name: 'fake',
      run: () => new Promise(() => {}), // never settles
      dispose: async () => {
        disposed = true;
      },
    };
    const ex = withConcurrencyLimit(engine, {
      maxConcurrency: 1,
      maxQueue: 5,
      queueTimeoutMs: 10_000,
    });

    ex.run(REQ); // active
    const queued = ex.run(REQ); // parked
    await flush();

    await ex.dispose();
    expect(disposed).toBe(true);
    await expect(queued).rejects.toMatchObject({ code: 'EXEC_SHUTTING_DOWN' });
  });

  it('rejects new runs with EXEC_SHUTTING_DOWN after dispose', async () => {
    const fake = deferredEngine();
    const ex = withConcurrencyLimit(fake.engine, {
      maxConcurrency: 2,
      maxQueue: 5,
      queueTimeoutMs: 1000,
    });
    await ex.dispose();
    await expect(ex.run(REQ)).rejects.toMatchObject({
      code: 'EXEC_SHUTTING_DOWN',
    });
  });

  it('releases the slot even when the engine run throws', async () => {
    let calls = 0;
    const engine = {
      name: 'fake',
      run: async () => {
        calls += 1;
        throw new Error('boom');
      },
    };
    const ex = withConcurrencyLimit(engine, {
      maxConcurrency: 1,
      maxQueue: 5,
      queueTimeoutMs: 1000,
    });

    await expect(ex.run(REQ)).rejects.toThrow('boom');
    // If the slot leaked, this second run would queue/stall instead of running.
    await expect(ex.run(REQ)).rejects.toThrow('boom');
    expect(calls).toBe(2);
  });
});
