'use strict';

const assert = require('assert');

const assignClients = require('./utils/assignClients');
const loadFixtures = require('./fixtures/load');

const Services = require('../services/init');
const Core = require('../core');

const testConfig = require('./testConfig');

describe('13 - core - functional(server): core.agendas().locations.merge', function() {
  let core;

  beforeAll(() => loadFixtures(testConfig.db, '014.sql'));
  beforeAll(() => assignClients(testConfig));

  beforeAll(async () => {
    const services = await Services(testConfig, {
      enabled: [
        'knex',
        'tracker',
        'accessTokens',
        'files',
        'queues',
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
        'keys'
      ]
    });

    core = Core(services, testConfig);
  });

  afterAll(() => {
    core.services.knex.destroy();
    testConfig.redisClient.quit();
  });

  beforeAll(async () => {
    // the merge does not find the locations as they are not listed in the agenda.
    await core.agendas(55268170).locations.merge(76464022, {
      uids: [95155140, 97506318]
    }, {
      name: 'Fusionné'
    });
  });

  it('merge location name is updated', async () => {
    assert.equal(
      await core.services.knex('location').first('placename').where('uid', 76464022).then(r => r.placename),
      'Fusionné'
    );
  });

  it('merged locations have been removed', async () => {
    assert.equal(
      await core.services.knex('location')
        .select('id')
        .whereIn('uid', [95155140, 97506318])
        .then(rows => rows.length),
      0
    );
  });

  it('event linked to merged location has been updated', async () => {
    assert.equal(
      await core.services.knex('event_2')
        .first('location_uid')
        .where('slug', 'que-ferons-nous-de-nos-deserts')
        .then(r => r.location_uid),
      76464022
    );
  });

  it('legacy event reference linked to merged location also has been updated', async () => {
    assert.equal(
      await core.services.knex('event_location')
        .first('location_id')
        .where('event_id', 802994)
        .then(r => r.location_id),
      8
    );
  });

});
