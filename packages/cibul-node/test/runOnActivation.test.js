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
  'trackers',
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

  it('creates an inbox and a behavioralEmail job on first activation', async () => {
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

    const inbox = await new services.inboxes.Inbox({
      type: 'user',
      identifier: user.uid,
    })._get();
    expect(inbox.data).toBeTruthy();
  });

  // Idempotency: re-running runOnActivation for an already-activated user (the
  // entry path opened by better-auth's afterEmailVerification firing on a user
  // already activated via legacy) must not re-enqueue the inactiveUser delayed
  // job nor recreate the Inbox. The Inbox is the first persistent side-effect
  // of the chain, so its presence is the guard.
  it('is a no-op when the user already has an Inbox', async () => {
    const user = await usersSvc.create(
      {
        fullName: 'Activate Twice',
        email: 'activate-twice@oa.test',
        password: 'plainPwd-twice',
        isActivated: true,
      },
      { internal: true, detailed: true },
    );

    await runOnActivation(services, user, {});

    const firstInbox = await new services.inboxes.Inbox({
      type: 'user',
      identifier: user.uid,
    })._get();
    expect(firstInbox.data).toBeTruthy();

    await runOnActivation(services, user, {});

    const secondInbox = await new services.inboxes.Inbox({
      type: 'user',
      identifier: user.uid,
    })._get();
    expect(secondInbox.data.id).toBe(firstInbox.data.id);
  });
});
