'use strict';

process.env.NODE_ENV = 'test';

const _ = require('lodash');
const knex = require('knex');
const mysql = require('mysql');
const { promisify } = require('util');
const should = require('should');

const assignClients = require('./utils/assignClients');
const fixtures = require('./fixtures/10_core_users_get.sql');

const core = require('../core');

const testConfig = require('./testConfig');

describe('core - functional (server): core.users().get', function() {

  this.timeout(10000);

  before(async () => {
    const con = mysql.createConnection(Object.assign(_.pick(testConfig.db, ['user', 'password']), {
      multipleStatements: true
    }));

    const query = promisify(con.query.bind(con));

    const result = await query(fixtures);

    con.end();
  });

  before(() => assignClients(testConfig));

  before(async () => {
    await core.init(testConfig, {
      enabled: [
        'accessTokens',
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
  });

  after(() => testConfig.knex.destroy());

  it('user can be retrieved using a valid access token', async () => {
    const janine = await core.users.get.byAccessToken('11a7946ddd256c768867ac3f2182cba0', 1);
    janine.uid.should.equal(1);
  });

  it('outdated access token throws error', async () => {
    let error;
    try {
      const janine = await core.users.get.byAccessToken('11a79182cddd2466c768867ac3f25ba0', 1);
    } catch (e) {
      error = e.message;
    }
    error.should.equal('access token is expired');
  });

  it('user can be retrieved using a public key', async () => {
    const janine = await core.users.get.byPublicKey('egP36aMb0toI8hAhFOm1if8auC1Vg1N9');
    janine.uid.should.equal(1);
  });

  it('user access token can be refreshed using the secret key', async () => {
    await testConfig.knex('access_token').update({
      created_at: new Date,
      lifespan: 100
    }).where('id', 2);

    const token = await core.users.generateToken('N0ty3poxNSTt5KTzxPJHUG6896UseQhM');
    token.id.should.equal(2);
    token.lifespan.should.equal(3600);
  });

  it('new access token is created when previous is outdated', async () => {
    await testConfig.knex('access_token').update({
      created_at: new Date,
      lifespan: 0
    }).where('id', 2);

    const token = await core.users.generateToken('N0ty3poxNSTt5KTzxPJHUG6896UseQhM');

    token.id.should.equal(3);
    token.lifespan.should.equal(3600);
  });

});
