'use strict';

const Services = require('../services/init');
const Core = require('../core');
const loadFixtures = require('./fixtures/load');

const testConfig = require('./testConfig');

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
      await core.services.knex('location').first('placename').where('uid', 76464022).then(r => r.placename),
    ).toBe('Fusionné');
  });

  it('merged locations have been soft removed', async () => {
    expect(
      await core.services.knex('location')
        .select('id')
        .whereIn('uid', [95155140, 97506318])
        .where('deleted', 1)
        .then(rows => rows.length),
    ).toBe(2);
  });

  it('event linked to merged location has been updated', async () => {
    expect(
      await core.services.knex('event_2')
        .first('location_uid')
        .where('slug', 'que-ferons-nous-de-nos-deserts')
        .then(r => r.location_uid),
    ).toBe(76464022);
  });

  it('legacy event reference linked to merged location also has been updated', async () => {
    expect(
      await core.services.knex('event_location')
        .first('location_id')
        .where('event_id', 802994)
        .then(r => r.location_id),
    ).toBe(8);
  });
});
