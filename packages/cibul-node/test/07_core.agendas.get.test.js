'use strict';

process.env.NODE_ENV = 'test';

const _ = require('lodash');
const knex = require('knex');
const mysql = require('mysql');
const { promisify } = require('util');

const assignClients = require('./utils/assignClients');
const fixtures = require('./fixtures/008.sql');

const Services = require('../services/init');
const Core = require('../core');

const testConfig = require('./testConfig');

describe('07 - core - functional (server): core.agendas().get', function() {
  let core;

  beforeAll(async () => {
    const con = mysql.createConnection(Object.assign( _.pick(testConfig.db, ['user', 'password']), {
      multipleStatements: true
    }));

    const query = promisify(con.query.bind(con));

    const result = await query(fixtures);

    con.end();
  });

  beforeAll(() => assignClients(testConfig));

  beforeAll(async () => {
    const services = await Services(testConfig, {
      enabled: [
        'queues',
        'events',
        'agendas',
        'aggregators',
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
        'tracker'
      ]
    });

    core = Core(services, testConfig);
  });

  afterAll(() => {
    testConfig.knex.destroy();
    testConfig.redisClient.quit();
  });

  it('simple get provides uid, title and slug', async () => {
    const agenda = await core.agendas(92983929).get();

    expect(agenda.uid).toBe(92983929);
    expect(agenda.title).toBe('Un agenda avec un champ contributeur');
    expect(agenda.slug).toBe('agenda-champ-contributeur');
  });

  it('detailed get provides consolidated schema', async () => {
    const agenda = await core.agendas(92983929).get({ detailed: true });

    expect(agenda.schema.fields.map(f => f.field)).toEqual(['categories', 'organisation-interne']);
  });

});
