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
