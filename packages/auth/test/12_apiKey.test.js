import { jest } from '@jest/globals';
import { defaultKeyHasher } from '@better-auth/api-key';
import Auth, { hashApiKey } from '../src/index.js';
import createApiKeyHelpers from '../src/apiKey.js';

const baseOpts = {
  mysqlPool: {},
  secret: 'x'.repeat(32),
  baseURL: 'http://localhost:3000',
};

// A minimal stand-in for the better-auth instance: only `api.verifyApiKey` is
// touched. `valid` + the stored `key` record drive every branch.
function fakeInstance(response) {
  return { api: { verifyApiKey: jest.fn(async () => response) } };
}

describe('createApiKeyHelpers — verifyKey (referenceId → owner)', () => {
  it('maps a bare uid referenceId to a user owner', async () => {
    const instance = fakeInstance({
      valid: true,
      key: { referenceId: '42', metadata: { oaKind: 'sk' } },
    });
    const { verifyKey } = createApiKeyHelpers(instance);
    const res = await verifyKey('oa_sk_x');
    expect(res).toMatchObject({
      owner: { kind: 'user', userUid: 42 },
      oaKind: 'sk',
      referenceId: '42',
    });
    expect(instance.api.verifyApiKey).toHaveBeenCalledWith({
      body: { key: 'oa_sk_x' },
    });
  });

  it('maps an agenda: referenceId to an agenda owner (numeric uid)', async () => {
    const { verifyKey } = createApiKeyHelpers(
      fakeInstance({
        valid: true,
        key: { referenceId: 'agenda:7', metadata: { oaKind: 'agenda' } },
      }),
    );
    const res = await verifyKey('k');
    expect(res.owner).toEqual({ kind: 'agenda', agendaUid: 7 });
    expect(res.oaKind).toBe('agenda');
  });

  it('returns null for an empty key without calling the plugin', async () => {
    const instance = fakeInstance({ valid: true, key: {} });
    const { verifyKey } = createApiKeyHelpers(instance);
    expect(await verifyKey('')).toBeNull();
    expect(instance.api.verifyApiKey).not.toHaveBeenCalled();
  });

  it('returns null when the key is not valid', async () => {
    const { verifyKey } = createApiKeyHelpers(
      fakeInstance({ valid: false, key: null }),
    );
    expect(await verifyKey('k')).toBeNull();
  });

  it('yields a null owner for a missing, empty, or non-numeric referenceId', async () => {
    const cases = [
      undefined,
      '',
      '   ',
      'not-a-number',
      '0x10',
      '1e3',
      'agenda:',
    ];
    for (const referenceId of cases) {
      const { verifyKey } = createApiKeyHelpers(
        fakeInstance({ valid: true, key: { referenceId } }),
      );
      expect((await verifyKey('k')).owner).toBeNull();
    }
  });

  it('propagates an infra fault instead of swallowing it as null', async () => {
    const { verifyKey } = createApiKeyHelpers({
      api: {
        verifyApiKey: jest.fn(async () => {
          throw new Error('store down');
        }),
      },
    });
    await expect(verifyKey('k')).rejects.toThrow('store down');
  });
});

describe('createApiKeyHelpers — create', () => {
  // The plugin echoes the body and returns the plaintext under `key`; the fake
  // mirrors that so we can assert the encoding (userId → referenceId) and the
  // pass-through of caller policy (name/prefix/permissions).
  function createInstance() {
    const createApiKey = jest.fn(async ({ body }) => ({
      id: `id-${body.userId}-${body.metadata.oaKind}`,
      key: `plaintext-${body.metadata.oaKind}`,
      referenceId: body.userId,
      metadata: body.metadata,
      name: body.name ?? null,
      prefix: body.prefix ?? null,
      permissions: body.permissions ?? null,
    }));
    return { instance: { api: { createApiKey } }, createApiKey };
  }

  it('creates a user pk+sk pair under referenceId = String(uid)', async () => {
    const { instance, createApiKey } = createInstance();
    const { createUserKeyPair } = createApiKeyHelpers(instance);

    const { publicKey, secretKey } = await createUserKeyPair(42);

    expect(publicKey.key).toBe('plaintext-pk');
    expect(secretKey.key).toBe('plaintext-sk');
    expect(publicKey.record.referenceId).toBe('42');
    expect(publicKey.record).not.toHaveProperty('key'); // plaintext not in record
    expect(createApiKey).toHaveBeenCalledTimes(2);
    expect(createApiKey.mock.calls[0][0].body).toMatchObject({
      userId: '42',
      metadata: { oaKind: 'pk', source: 'native' },
    });
    expect(createApiKey.mock.calls[1][0].body.metadata.oaKind).toBe('sk');
  });

  it('creates an agenda key under referenceId = agenda:<uid>', async () => {
    const { instance, createApiKey } = createInstance();
    const { createAgendaKey } = createApiKeyHelpers(instance);

    const { key, record } = await createAgendaKey(7);

    expect(key).toBe('plaintext-agenda');
    expect(record.referenceId).toBe('agenda:7');
    expect(createApiKey).toHaveBeenCalledWith({
      body: {
        userId: 'agenda:7',
        metadata: { oaKind: 'agenda', source: 'native' },
      },
    });
  });

  it('passes caller policy (name/prefix/permissions) through to the plugin', async () => {
    const { instance, createApiKey } = createInstance();
    const { createAgendaKey } = createApiKeyHelpers(instance);

    await createAgendaKey(7, {
      name: 'CI export',
      prefix: 'oa_agenda',
      permissions: { events: ['read'] },
    });

    expect(createApiKey.mock.calls[0][0].body).toMatchObject({
      userId: 'agenda:7',
      name: 'CI export',
      prefix: 'oa_agenda',
      permissions: { events: ['read'] },
    });
  });
});

describe('createApiKeyHelpers — list / revoke (adapter bypass)', () => {
  // Stand-in for the better-auth context adapter (model 'apikey'). `rows` is the
  // store; findMany filters by the referenceId condition, findOne/delete match
  // every where condition (AND), mirroring the real adapter.
  function adapterInstance(rows) {
    const matches = (row, where) =>
      where.every((c) => row[c.field] === c.value);
    const adapter = {
      findMany: jest.fn(async ({ where }) =>
        rows.filter((r) => matches(r, where))),
      findOne: jest.fn(
        async ({ where }) => rows.find((r) => matches(r, where)) ?? null,
      ),
      delete: jest.fn(async ({ where }) => {
        const i = rows.findIndex((r) => matches(r, where));
        if (i !== -1) rows.splice(i, 1);
      }),
    };
    return { instance: { $context: Promise.resolve({ adapter }) }, adapter };
  }

  it('lists a user owner by referenceId = String(uid), without key material', async () => {
    const { instance, adapter } = adapterInstance([
      { id: 'a', referenceId: '42', key: 'hash-a' },
      { id: 'b', referenceId: '42', key: 'hash-b' },
      { id: 'c', referenceId: '99', key: 'hash-c' },
    ]);
    const { listUserKeys } = createApiKeyHelpers(instance);
    const rows = await listUserKeys(42);
    expect(rows.map((r) => r.id)).toEqual(['a', 'b']);
    expect(rows.every((r) => !('key' in r))).toBe(true); // stored hash stripped
    expect(adapter.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'apikey',
        where: [{ field: 'referenceId', value: '42' }],
      }),
    );
  });

  it('lists an agenda owner by referenceId = agenda:<uid>', async () => {
    const { instance } = adapterInstance([
      { id: 'x', referenceId: 'agenda:7' },
      { id: 'y', referenceId: '7' },
    ]);
    const { listAgendaKeys } = createApiKeyHelpers(instance);
    const rows = await listAgendaKeys(7);
    expect(rows.map((r) => r.id)).toEqual(['x']);
  });

  it('revokes a key scoped to its owner and reports success', async () => {
    const { instance, adapter } = adapterInstance([
      { id: 'a', referenceId: 'agenda:7' },
    ]);
    const { revokeAgendaKey } = createApiKeyHelpers(instance);

    const ok = await revokeAgendaKey(7, 'a');
    expect(ok).toBe(true);
    expect(adapter.delete).toHaveBeenCalledWith({
      model: 'apikey',
      where: [
        { field: 'id', value: 'a' },
        { field: 'referenceId', value: 'agenda:7' },
      ],
    });
  });

  it('refuses to revoke a key owned by someone else (no delete, returns false)', async () => {
    const { instance, adapter } = adapterInstance([
      { id: 'a', referenceId: 'agenda:7' },
    ]);
    const { revokeAgendaKey } = createApiKeyHelpers(instance);

    // Same keyId, wrong owner (agenda 8) → must not touch agenda 7's key.
    const ok = await revokeAgendaKey(8, 'a');
    expect(ok).toBe(false);
    expect(adapter.delete).not.toHaveBeenCalled();
  });
});

describe('the instance exposes the api-key façades', () => {
  it('binds verifyKey on the instance (delegates to the plugin)', async () => {
    const auth = Auth(baseOpts);
    auth.instance.api.verifyApiKey = jest.fn(async () => ({
      valid: true,
      key: { referenceId: '99', metadata: { oaKind: 'pk' } },
    }));
    const res = await auth.verifyKey('oa_pk_x');
    expect(res.owner).toEqual({ kind: 'user', userUid: 99 });
    expect(auth.instance.api.verifyApiKey).toHaveBeenCalledWith({
      body: { key: 'oa_pk_x' },
    });
  });

  it('exposes hashApiKey both on the instance and as a package-root export', () => {
    const auth = Auth(baseOpts);
    expect(auth.hashApiKey).toBe(hashApiKey);
  });
});

describe('hashApiKey', () => {
  it('is deterministic and byte-identical to the plugin hasher', async () => {
    const a = await hashApiKey('some-plaintext-key');
    const b = await hashApiKey('some-plaintext-key');
    expect(a).toBe(b);
    expect(a).toBe(await defaultKeyHasher('some-plaintext-key'));
  });
});
