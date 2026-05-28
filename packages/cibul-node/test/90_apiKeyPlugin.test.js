import Services from '../services/init.js';
import testConfig from './testConfig.js';
import setup from './fixtures/setup.js';

// D1 smoke test: the @better-auth/api-key plugin is wired into @openagenda/auth
// and the `api_key` table migration is correct. Exercises a server-side
// create + verify roundtrip in-process (no HTTP, no session) — which is also
// how the v3 key helpers will drive it in later slices. Calling without
// headers puts createApiKey in "server mode", where `userId` sets the generic
// referenceId and server-only fields (permissions) are accepted.

const enabled = [
  'knex',
  'redis',
  'auth',
  'simpleCache',
  'accessTokens',
  'bull',
  'files',
  'users',
  'members',
  'networks',
  'mails',
  'unsubscriptions',
  'genUrl',
  'errors',
  'security',
];

describe('90 - api-key plugin (better-auth): create + verify roundtrip', () => {
  let services;

  const config = testConfig.extendWith({ cachePrefix: 'apikey_plugin_test' });

  beforeAll(async () => {
    await setup({
      mysql: config.db,
      schemas: config.schemas,
      enabled,
      data: [],
    });
  });

  beforeAll(async () => {
    services = await Services(config, { enabled });
  });

  afterAll(() => services.shutdown({ clear: true }));

  it('creates a prefixed key and verifies it (referenceId + permissions persisted)', async () => {
    const created = await services.auth.api.createApiKey({
      body: {
        userId: 'smoke-user-1',
        prefix: 'oa_sk_',
        name: 'smoke',
        permissions: { events: ['read', 'write'] },
      },
    });

    // Plaintext key returned only here, carrying the requested prefix.
    expect(typeof created.key).toBe('string');
    expect(created.key.startsWith('oa_sk_')).toBe(true);

    const verified = await services.auth.api.verifyApiKey({
      body: { key: created.key },
    });

    expect(verified.valid).toBe(true);
    expect(verified.error).toBeNull();
    // Ownership round-trips through the snake_case `reference_id` column.
    expect(verified.key.referenceId).toBe('smoke-user-1');
    // Scopes round-trip through the `permissions` JSON column.
    expect(verified.key.permissions).toEqual({ events: ['read', 'write'] });
  });
});
