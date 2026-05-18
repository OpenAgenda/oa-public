import Services from '../services/init.js';
import Core from '../core/index.js';
import testConfig from './testConfig.js';
import setup from './fixtures/setup.js';

const enabled = [
  'knex',
  'redis',
  'simpleCache',
  'tracker',
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
  'activities',
];

const AGENDA_UID = 17026855;
const EVENT_UID = 48564567;
const CURRENT_OWNER_UID = 63170203; // eslint-disable-line no-unused-vars -- used by later tasks
const ADMIN_UID = 1; // administrator, member of AGENDA_UID
const TARGET_UID = 63170200; // janine, moderator, member of AGENDA_UID
const READER_UID = 99999001; // seeded reader (target for role-too-low test)
const SPARE_CONTRIBUTOR_UID = 99999002; // seeded contributor (acting for not-owner test)

describe('core - functional (server): core.agendas().events.transferOwnership', () => {
  let core;

  const config = testConfig.extendWith({
    queuesPrefix: 'qTransferOwnership:',
    es75: {
      ...testConfig.es75,
      agendaEventsIndex: 'test_events_transfer_ownership',
    },
  });

  beforeAll(async () => {
    await setup({
      mysql: config.db,
      schemas: config.schemas,
      enabled,
      data: ['014.sql.js'],
    });
  });

  beforeAll(async () => {
    const services = await Services(config, { enabled });
    core = Core(services, config);

    // Inline seed: spare reader + spare contributor in AGENDA_UID
    const now = new Date();
    await core.services.knex('reviewer').insert([
      {
        agenda_uid: AGENDA_UID,
        user_uid: READER_UID,
        credential: 4, // reader
        created_at: now,
        updated_at: now,
      },
      {
        agenda_uid: AGENDA_UID,
        user_uid: SPARE_CONTRIBUTOR_UID,
        credential: 1, // contributor
        created_at: now,
        updated_at: now,
      },
    ]);

    await core.services.eventSearch
      .getConfig()
      .client.indices.delete({ index: 'test' })
      .catch(() => null);
    await core.agendas(AGENDA_UID).events.search.rebuild();

    await core.services.formSchemas.clearCache();
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  // ---- Failure cases first (no state mutation) ----

  it('throws NotFound when the agenda does not exist', async () => {
    await expect(
      core
        .agendas(99999999)
        .events.transferOwnership(
          EVENT_UID,
          { userUid: TARGET_UID },
          { context: { userUid: ADMIN_UID } },
        ),
    ).rejects.toMatchObject({
      name: 'NotFound',
      message: expect.stringContaining('agenda not found'),
    });
  });

  it('throws NotFound when the event does not exist', async () => {
    await expect(
      core
        .agendas(AGENDA_UID)
        .events.transferOwnership(
          99999999,
          { userUid: TARGET_UID },
          { context: { userUid: ADMIN_UID } },
        ),
    ).rejects.toMatchObject({
      name: 'NotFound',
      message: expect.stringContaining('event not found'),
    });
  });

  // ---- Happy-path cases last ----

  it('admin transfers event ownership to another member', async () => {
    await core
      .agendas(AGENDA_UID)
      .events.transferOwnership(
        EVENT_UID,
        { userUid: TARGET_UID },
        { context: { userUid: ADMIN_UID } },
      );

    const event = await core.services.events.get(EVENT_UID, {
      access: 'internal',
      private: null,
    });
    expect(event.ownerUid).toBe(TARGET_UID);

    const agendaEvent = await core.services
      .agendaEvents(AGENDA_UID)
      .get(EVENT_UID);
    expect(agendaEvent.userUid).toBe(TARGET_UID);
  });
});
