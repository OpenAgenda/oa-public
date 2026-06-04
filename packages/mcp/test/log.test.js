import { createHash } from 'node:crypto';
import { credentialFp, makeAuditRecorder } from '../src/log.js';

// Pure unit tests for the audit/log helpers. Hand-rolled stubs (no jest.fn) to
// match this package's tests: makeAuditRecorder takes an injectable sink, so we
// capture what it would emit without configuring a real transport (no network).

describe('credentialFp', () => {
  it('is a 12-hex prefix of the secret SHA-256, never the secret', () => {
    const secret = 'oa_pk_some_secret_value';
    const fp = credentialFp(secret);
    expect(fp).toMatch(/^[0-9a-f]{12}$/);
    expect(fp).toBe(
      createHash('sha256').update(secret).digest('hex').slice(0, 12),
    );
    expect(fp).not.toContain(secret);
  });

  it('is undefined for an absent credential', () => {
    expect(credentialFp(undefined)).toBeUndefined();
    expect(credentialFp(null)).toBeUndefined();
    expect(credentialFp('')).toBeUndefined();
  });

  it('is stable for the same key and differs across keys', () => {
    expect(credentialFp('k1')).toBe(credentialFp('k1'));
    expect(credentialFp('k1')).not.toBe(credentialFp('k2'));
  });
});

describe('makeAuditRecorder', () => {
  const capture = () => {
    const calls = [];
    return { calls, sink: (tool, meta) => calls.push({ tool, meta }) };
  };

  it('emits one record per call, tagged kind:audit + transport + caller identity (http)', () => {
    const { calls, sink } = capture();
    const record = makeAuditRecorder(
      { transport: 'http', callerId: 'user-123', clientId: 'test-client' },
      sink,
    );
    record('execute', { outcome: 'ok', duration_ms: 7 });
    expect(calls).toHaveLength(1);
    expect(calls[0].tool).toBe('execute');
    expect(calls[0].meta).toEqual({
      kind: 'audit',
      transport: 'http',
      callerId: 'user-123',
      clientId: 'test-client',
      outcome: 'ok',
      duration_ms: 7,
    });
  });

  it('omits caller/client on stdio (no OAuth identity), keeping transport + fields', () => {
    const { calls, sink } = capture();
    const record = makeAuditRecorder({ transport: 'stdio' }, sink);
    record('search_docs', { outcome: 'ok', query: 'events', results_count: 3 });
    expect(calls[0].meta).toEqual({
      kind: 'audit',
      transport: 'stdio',
      outcome: 'ok',
      query: 'events',
      results_count: 3,
    });
    expect(calls[0].meta).not.toHaveProperty('callerId');
    expect(calls[0].meta).not.toHaveProperty('clientId');
  });

  it('does not let a falsy callerId/clientId leak into the record', () => {
    const { calls, sink } = capture();
    const record = makeAuditRecorder(
      { transport: 'http', callerId: '', clientId: undefined },
      sink,
    );
    record('execute', { outcome: 'rate_limited' });
    expect(calls[0].meta).toEqual({
      kind: 'audit',
      transport: 'http',
      outcome: 'rate_limited',
    });
  });
});
