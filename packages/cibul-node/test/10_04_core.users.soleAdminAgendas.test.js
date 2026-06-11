import _ from 'lodash';
import Services from '../services/init.js';
import Core from '../core/index.js';
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
];

const byUid = (agendas) => _.sortBy(agendas, 'uid');

describe('10 - core - functional (server): core.users().soleAdminAgendas()', () => {
  let core;

  beforeAll(async () => {
    await setup({
      mysql: testConfig.db,
      schemas: testConfig.schemas,
      enabled,
      data: ['009.sql.js'],
    });
  });

  beforeAll(async () => {
    const services = await Services(testConfig, { enabled });

    core = Core(services, testConfig);

    await services.formSchemas.clearCache();
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  it('lists the agendas where the user is the only administrator', async () => {
    // user 1 is the sole administrator of agenda 3, but only a contributor of
    // agendas 2 and 11. (user 1 also has a membership on agenda 9, but that
    // fixture has no agenda record, so it is not surfaced — a deleted agenda
    // does not need an administrator.)
    const agendas = await core.users({ uid: 1 }).soleAdminAgendas();

    expect(agendas).toEqual([
      {
        uid: 3,
        slug: 'les-plus-beaux-villages-de-france',
        title: 'Les Plus Beaux Villages de France',
      },
    ]);
  });

  it('lists the agenda for another sole administrator', async () => {
    // lise (uid 50073466) is the sole administrator of agenda 2.
    const agendas = await core.users({ uid: 50073466 }).soleAdminAgendas();

    expect(agendas).toEqual([
      {
        uid: 2,
        slug: 'un-agenda-thematique',
        title: 'Un agenda thématique',
      },
    ]);
  });

  it('drops an agenda once another administrator remains', async () => {
    // add a second administrator to agenda 3 alongside user 1
    await core.services.knex('reviewer').insert({
      id: 777777,
      agenda_uid: 3,
      user_uid: 777777,
      credential: 2,
      created_at: '2017-10-30 14:21:07',
      updated_at: '2017-10-30 14:21:07',
    });

    let agendas;
    try {
      agendas = await core.users({ uid: 1 }).soleAdminAgendas();
    } finally {
      // Clean up even if the assertion below throws, so a failed run does not
      // leave a second admin on agenda 3 for the other tests.
      await core.services.knex('reviewer').where({ id: 777777 }).delete();
    }

    expect(byUid(agendas)).toEqual([]);
  });

  it('returns an empty list for a user that administers nothing alone', async () => {
    // user 99999967 is not a member of any agenda.
    const agendas = await core.users({ uid: 99999967 }).soleAdminAgendas();

    expect(agendas).toEqual([]);
  });
});
