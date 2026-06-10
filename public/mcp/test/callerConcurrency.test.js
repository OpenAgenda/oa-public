// Per-caller concurrency cap — pure unit tests. Covers admitting up to the cap,
// refusing past it, freeing a slot on release (and re-admitting after), per-key
// independence, idempotent release, the Map staying bounded to callers with a
// live run, and the fail-closed config guard.

import { createCallerConcurrencyLimiter } from '../src/callerConcurrency.js';

describe('createCallerConcurrencyLimiter', () => {
  it('admits up to maxPerCaller, then refuses', () => {
    const lim = createCallerConcurrencyLimiter({ maxPerCaller: 2 });
    expect(lim.tryAcquire('u').acquired).toBe(true);
    expect(lim.tryAcquire('u').acquired).toBe(true);
    expect(lim.tryAcquire('u').acquired).toBe(false); // at cap
    expect(lim.inflightFor('u')).toBe(2);
  });

  it('frees a slot on release and re-admits', () => {
    const lim = createCallerConcurrencyLimiter({ maxPerCaller: 1 });
    const a = lim.tryAcquire('u');
    expect(a.acquired).toBe(true);
    expect(lim.tryAcquire('u').acquired).toBe(false); // full
    a.release();
    expect(lim.inflightFor('u')).toBe(0);
    expect(lim.tryAcquire('u').acquired).toBe(true); // slot freed
  });

  it('keys are independent', () => {
    const lim = createCallerConcurrencyLimiter({ maxPerCaller: 1 });
    expect(lim.tryAcquire('x').acquired).toBe(true);
    expect(lim.tryAcquire('x').acquired).toBe(false);
    expect(lim.tryAcquire('y').acquired).toBe(true); // y has its own budget
  });

  it('release is idempotent (double release frees only one slot)', () => {
    const lim = createCallerConcurrencyLimiter({ maxPerCaller: 2 });
    const a = lim.tryAcquire('u');
    lim.tryAcquire('u'); // second slot held
    expect(lim.inflightFor('u')).toBe(2);
    a.release();
    a.release(); // no-op the second time — must not over-decrement
    expect(lim.inflightFor('u')).toBe(1);
  });

  it("a refused acquire's release is a harmless no-op", () => {
    const lim = createCallerConcurrencyLimiter({ maxPerCaller: 1 });
    lim.tryAcquire('u'); // fills the cap
    const refused = lim.tryAcquire('u');
    expect(refused.acquired).toBe(false);
    expect(() => refused.release()).not.toThrow();
    expect(lim.inflightFor('u')).toBe(1); // unchanged — didn't free someone else's slot
  });

  it('drops a key once its in-flight count returns to 0 (bounded Map)', () => {
    const lim = createCallerConcurrencyLimiter({ maxPerCaller: 1 });
    const a = lim.tryAcquire('a');
    const b = lim.tryAcquire('b');
    expect(lim.size).toBe(2);
    a.release();
    expect(lim.size).toBe(1); // 'a' reclaimed
    b.release();
    expect(lim.size).toBe(0); // both gone — no idle entries linger
  });

  it('rejects an unusable config (maxPerCaller < 1)', () => {
    expect(() => createCallerConcurrencyLimiter({ maxPerCaller: 0 })).toThrow(
      /maxPerCaller >= 1/,
    );
  });
});
