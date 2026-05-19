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
];

describe('13 - core - functional(server): core.agendas().locations.merge', () => {
  let core;

  beforeAll(async () => {
    await setup({
      mysql: testConfig.db,
      schemas: testConfig.schemas,
      enabled,
      data: ['014.sql.js'],
    });
  });

  beforeAll(async () => {
    const services = await Services(testConfig, { enabled });

    core = Core(services, testConfig);

    await services.formSchemas.clearCache();

    services.agendaLocations.task({ reset: true, detectDuplicates: false });
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  beforeAll(async () => {
    // the merge does not find the locations as they are not listed in the agenda.
    await core.agendas(55268170).locations.merge(
      76464022,
      {
        uids: [95155140, 97506318],
      },
      {
        name: 'Fusionné',
      },
    );
    return new Promise((rs) => {
      core.services.tracker.on(
        'agendaLocations.updateEventLocationReferences.done',
        rs,
        true,
      );
    });
  });

  it('merge location name is updated', async () => {
    expect(
      await core.services
        .knex('location')
        .first('placename')
        .where('uid', 76464022)
        .then(({ placename }) => placename),
    ).toBe('Fusionné');
  });

  it('merged locations have been soft removed', async () => {
    expect(
      await core.services
        .knex('location')
        .select('id')
        .whereIn('uid', [95155140, 97506318])
        .where('deleted', 1)
        .then(({ length }) => length),
    ).toBe(2);
  });

  it('event linked to merged location has been updated', async () => {
    expect(
      await core.services
        .knex('event_2')
        .first('location_uid')
        .where('slug', 'que-ferons-nous-de-nos-deserts')
        .then(({ location_uid: locationUID }) => locationUID),
    ).toBe(76464022);
  });

  it('agenda_event user_uid is preserved on the merged event', async () => {
    const agendaEvent = await core.services
      .agendaEvents(49405812)
      .get(83829657);

    expect(agendaEvent?.userUid).toBe(56659395);
  });
});
