import { jest } from '@jest/globals';
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

    // Fix event timings: fixture has begin == end which fails validation; patch to begin < end
    await core.services
      .knex('event_2')
      .where({ uid: EVENT_UID })
      .update({
        timings: JSON.stringify([
          {
            begin: '2020-03-14T10:00:00+0200',
            end: '2020-03-14T12:00:00+0200',
          },
        ]),
      });

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

  it('throws NotFound when the agenda_event reference row is missing', async () => {
    // Drop the agenda_event row for event 83829660 (from eventSet 7, agenda 17026855)
    // so the call must reject before any write happens.
    const STRAY_EVENT_UID = 83829660;
    await core.services.knex('agenda_event').delete().where({
      agenda_uid: AGENDA_UID,
      event_uid: STRAY_EVENT_UID,
    });

    await expect(
      core
        .agendas(AGENDA_UID)
        .events.transferOwnership(
          STRAY_EVENT_UID,
          { userUid: TARGET_UID },
          { context: { userUid: ADMIN_UID } },
        ),
    ).rejects.toMatchObject({ name: 'NotFound' });
  });

  it('throws NotFound when the target user is not a member of the agenda', async () => {
    await expect(
      core.agendas(AGENDA_UID).events.transferOwnership(
        EVENT_UID,
        { userUid: 88888888 }, // never seeded
        { context: { userUid: ADMIN_UID } },
      ),
    ).rejects.toMatchObject({
      name: 'NotFound',
      message: expect.stringContaining('target member not found'),
    });
  });

  it('throws Forbidden when the target member role is below contributor', async () => {
    await expect(
      core
        .agendas(AGENDA_UID)
        .events.transferOwnership(
          EVENT_UID,
          { userUid: READER_UID },
          { context: { userUid: ADMIN_UID } },
        ),
    ).rejects.toMatchObject({
      name: 'Forbidden',
      message: expect.stringContaining('target cannot edit events'),
    });
  });

  it('throws Forbidden when no acting user is provided in context', async () => {
    await expect(
      core
        .agendas(AGENDA_UID)
        .events.transferOwnership(EVENT_UID, { userUid: TARGET_UID }, {}),
    ).rejects.toMatchObject({
      name: 'Forbidden',
      message: expect.stringContaining('not authorized to transfer ownership'),
    });
  });

  it('throws Forbidden when acting member is contributor but not the current owner', async () => {
    await expect(
      core
        .agendas(AGENDA_UID)
        .events.transferOwnership(
          EVENT_UID,
          { userUid: TARGET_UID },
          { context: { userUid: SPARE_CONTRIBUTOR_UID } },
        ),
    ).rejects.toMatchObject({
      name: 'Forbidden',
      message: expect.stringContaining('not authorized to transfer ownership'),
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

  it('current owner can transfer ownership to another member', async () => {
    // Reset ownership to the original contributor so the owner-acting branch can be tested
    await core
      .agendas(AGENDA_UID)
      .events.transferOwnership(
        EVENT_UID,
        { userUid: CURRENT_OWNER_UID },
        { context: { userUid: ADMIN_UID } },
      );

    await core
      .agendas(AGENDA_UID)
      .events.transferOwnership(
        EVENT_UID,
        { userUid: TARGET_UID },
        { context: { userUid: CURRENT_OWNER_UID } },
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

  it('is a no-op when the target is already the current owner', async () => {
    const beforeEvent = await core.services.events.get(EVENT_UID, {
      access: 'internal',
      private: null,
    });
    const before = await core.services.agendaEvents(AGENDA_UID).get(EVENT_UID);

    await core
      .agendas(AGENDA_UID)
      .events.transferOwnership(
        EVENT_UID,
        { userUid: beforeEvent.ownerUid },
        { context: { userUid: ADMIN_UID } },
      );

    const after = await core.services.agendaEvents(AGENDA_UID).get(EVENT_UID);

    const beforeUpdatedAt = before.updatedAt?.toISOString?.() ?? before.updatedAt;
    const afterUpdatedAt = after.updatedAt?.toISOString?.() ?? after.updatedAt;
    expect(afterUpdatedAt).toBe(beforeUpdatedAt);
  });

  it('refreshes the search index with the new ownerUid', async () => {
    // Reset to a known owner state so we can do a real transfer in this test
    const currentEvent = await core.services.events.get(EVENT_UID, {
      access: 'internal',
      private: null,
    });
    const otherUid = currentEvent.ownerUid === TARGET_UID ? CURRENT_OWNER_UID : TARGET_UID;

    await core
      .agendas(AGENDA_UID)
      .events.transferOwnership(
        EVENT_UID,
        { userUid: otherUid },
        { context: { userUid: ADMIN_UID } },
      );

    const indexed = await core
      .agendas(AGENDA_UID)
      .events.search.get(
        { uid: EVENT_UID },
        { userUid: ADMIN_UID, detailed: true },
      );
    expect(indexed.ownerUid).toBe(otherUid);
  });

  it('keeps the additional (custom) fields when reindexing after transfer', async () => {
    // Regression: transferOwnership reindexed the event without loading its
    // custom data, so the search index lost every additional field. Seed a
    // custom field, transfer, and assert the reindexed event still carries it.
    const FORM_SCHEMA_ID = 2; // agenda 17026855 -> form_schema_id 2
    await core.services
      .custom(FORM_SCHEMA_ID)
      .set(
        EVENT_UID,
        { custom_description: 'KEEP_ME_AFTER_TRANSFER' },
        { validate: false, partial: true },
      );

    const currentEvent = await core.services.events.get(EVENT_UID, {
      access: 'internal',
      private: null,
    });
    const otherUid = currentEvent.ownerUid === TARGET_UID ? CURRENT_OWNER_UID : TARGET_UID;

    const updateSpy = jest.spyOn(core.services.eventSearch, 'update');

    try {
      await core
        .agendas(AGENDA_UID)
        .events.transferOwnership(
          EVENT_UID,
          { userUid: otherUid },
          { context: { userUid: ADMIN_UID } },
        );

      expect(updateSpy).toHaveBeenCalled();
      const indexedEvent = updateSpy.mock.calls.at(-1)[0].event;
      expect(indexedEvent.custom_description).toBe('KEEP_ME_AFTER_TRANSFER');
    } finally {
      updateSpy.mockRestore();
    }
  });

  it('writes a transferOwnership activity entry', async () => {
    const before = await core.services.knex('activity').count({ count: '*' });
    const beforeCount = parseInt(before[0].count, 10);

    // Pick the "other" owner to guarantee a meaningful transfer (no short-circuit)
    const currentEvent = await core.services.events.get(EVENT_UID, {
      access: 'internal',
      private: null,
    });
    const otherUid = currentEvent.ownerUid === TARGET_UID ? CURRENT_OWNER_UID : TARGET_UID;

    await core
      .agendas(AGENDA_UID)
      .events.transferOwnership(
        EVENT_UID,
        { userUid: otherUid },
        { context: { userUid: ADMIN_UID } },
      );

    const matching = await core.services
      .knex('activity')
      .count({ count: '*' })
      .where('verb', 'event.transferOwnership');
    expect(parseInt(matching[0].count, 10)).toBeGreaterThan(0);

    const total = await core.services.knex('activity').count({ count: '*' });
    expect(parseInt(total[0].count, 10)).toBeGreaterThan(beforeCount);
  });
});
