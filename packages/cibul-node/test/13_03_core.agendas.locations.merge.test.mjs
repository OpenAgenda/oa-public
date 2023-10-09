import Services from '../services/init.mjs';
import Core from '../core/index.js';
import loadFixtures from './fixtures/load.js';
import testConfig from './testConfig.js';

describe('13 - core - functional(server): core.agendas().locations.merge', () => {
  let core;

  beforeAll(() => loadFixtures(testConfig.db, '014.sql'));

  beforeAll(async () => {
    const services = await Services(testConfig, {
      enabled: [
        'knex',
        'redis',
        'simpleCache',
        'tracker',
        'accessTokens',
        'files',
        'queues',
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
        'legacy',
        'users',
        'keys',
      ],
    });

    core = Core(services, testConfig);
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  beforeAll(async () => {
    // the merge does not find the locations as they are not listed in the agenda.
    await core.agendas(55268170).locations.merge(76464022, {
      uids: [95155140, 97506318],
    }, {
      name: 'Fusionné',
    });
  });

  it('merge location name is updated', async () => {
    expect(
      await core.services.knex('location').first('placename').where('uid', 76464022).then(({ placename }) => placename),
    ).toBe('Fusionné');
  });

  it('merged locations have been soft removed', async () => {
    expect(
      await core.services.knex('location')
        .select('id')
        .whereIn('uid', [95155140, 97506318])
        .where('deleted', 1)
        .then(({ length }) => length),
    ).toBe(2);
  });

  it('event linked to merged location has been updated', async () => {
    expect(
      await core.services.knex('event_2')
        .first('location_uid')
        .where('slug', 'que-ferons-nous-de-nos-deserts')
        .then(({ location_uid: locationUID }) => locationUID),
    ).toBe(76464022);
  });

  it('legacy event reference linked to merged location also has been updated', async () => {
    expect(
      await core.services.knex('event_location')
        .first('location_id')
        .where('event_id', 802994)
        .then(({ location_id: locationID }) => locationID),
    ).toBe(8);
  });
});
