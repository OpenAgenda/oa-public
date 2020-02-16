'use strict';

process.env.NODE_ENV = 'test';

const _ = require('lodash');
const knex = require('knex');
const mysql = require('mysql');
const { promisify } = require('util');
const should = require('should');

const assignClients = require('./utils/assignClients');
const fixtures = require('./fixtures/008.sql');

const Services = require('../services/init');
const Core = require('../core');

const testConfig = require('./testConfig');

describe('07 - core - functional (server): core.agendas().get', function() {
  this.timeout(20000);
  let core;

  before(async () => {
    const con = mysql.createConnection(Object.assign( _.pick(testConfig.db, ['user', 'password']), {
      multipleStatements: true
    }));

    const query = promisify(con.query.bind(con));

    const result = await query(fixtures);

    con.end();
  });

  before(() => assignClients(testConfig));

  before(async () => {
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

  after(() => testConfig.knex.destroy());

  it('simple get provides uid, title and slug', async () => {
    const agenda = await core.agendas(92983929).get();

    agenda.uid.should.equal(92983929);
    agenda.title.should.equal('Un agenda avec un champ contributeur');
    agenda.slug.should.equal('agenda-champ-contributeur');
  });

  it('detailed get provides consolidated schema', async () => {
    const agenda = await core.agendas(92983929).get({ detailed: true });

    agenda.schema.fields.map(f => f.field).should.eql(['categories', 'organisation-interne']);
  });

});
