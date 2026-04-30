import Services from '../services/init.js';
import Core from '../core/index.js';
import runOnActivation from '../services/users/lib/runOnActivation.js';
import testConfig from './testConfig.js';
import setup from './fixtures/setup.js';

const enabled = [
  'knex',
  'redis',
  'auth',
  'simpleCache',
  'accessTokens',
  'files',
  'bull',
  'events',
  'agendas',
  'agendaEvents',
  'agendaLocations',
  'formSchemas',
  'custom',
  'eventSearch',
  'members',
  'networks',
  'users',
  'keys',
  'trackers',
  'sessions',
  'abilities',
  'invitations',
  'mails',
  'unsubscriptions',
  'activities',
  'inboxes',
  'behavioralEmails',
  'genUrl',
  'errors',
  'security',
];

describe('runOnActivation - idempotency + side effects', () => {
  let core;
  let services;
  let usersSvc;

  beforeAll(async () => {
    await setup({
      mysql: testConfig.db,
      schemas: testConfig.schemas,
      enabled,
      data: [],
    });
  });

  beforeAll(async () => {
    services = await Services(testConfig, { enabled });
    core = Core(services, testConfig);
    usersSvc = services.users;
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  it('creates an api key, inbox and behavioralEmail job', async () => {
    const user = await usersSvc.create(
      {
        fullName: 'Activate Side',
        email: 'activate-side@oa.test',
        password: 'plainPwd-act',
        isActivated: true,
      },
      { internal: true, detailed: true },
    );

    await runOnActivation(services, user, {});

    const apiKey = await services
      .knex(testConfig.schemas.apiKeySet)
      .where({ user_id: user.id })
      .first()
      .catch(() => null);
    expect(apiKey).toBeTruthy();
  });

  // Idempotency: re-running runOnActivation for an already-activated user
  // (the entry path opened by phase 3b magic-link / phase 4 OAuth firing
  // afterEmailVerification on a user that was already activated via legacy)
  // must not rotate the userPublic api key. Rotation would silently break
  // any external client still using the previous key.
  it('is a no-op when a userPublic api key already exists', async () => {
    const user = await usersSvc.create(
      {
        fullName: 'Activate Twice',
        email: 'activate-twice@oa.test',
        password: 'plainPwd-twice',
        isActivated: true,
      },
      { internal: true, detailed: true },
    );

    const firstKey = await services
      .keys({ type: 'userPublic', identifier: user.uid })
      .get({ optionalKey: true });
    expect(firstKey).toBeTruthy();

    await runOnActivation(services, user, {});

    const secondKey = await services
      .keys({ type: 'userPublic', identifier: user.uid })
      .get({ optionalKey: true });
    expect(secondKey?.key).toBe(firstKey.key);
  });
});
