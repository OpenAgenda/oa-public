'use strict';

const _ = require('lodash');
const axios = require('axios');
const mysql = require('mysql');
const { promisify } = require('util');

const assignClients = require('./utils/assignClients');
const fixtures = require('./fixtures/013.sql');

const api = require('../api');
const Services = require('../services/init');
const Core = require('../core');

const testConfig = require('./testConfig');

describe('12 - core - functional (server): core.networks().agendas', () => {
  let core;

  beforeAll(async () => {
    const con = mysql.createConnection(Object.assign(_.pick(testConfig.db, ['user', 'password']), {
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
        'knex',
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

  describe('core.networks.agendas.add', () => {

    describe('successful', () => {
      let result;

      beforeAll(async () => {
        result = await core.networks(1).agendas.add(3);
      });

      it('result is updated agenda', () => {
        expect(result.uid).toBe(3);
      });

      it('network reference is included in response', () => {
        expect(result.networkUid).toBe(1);
      });

      it('db entry has network reference', async () => {
        const entry = await testConfig.knex('review')
          .first(['network_uid'])
          .where('uid', 3);

        expect(entry.network_uid).toBe(1);
      });

    });

    describe('fail due to Agenda already being associated to a network', () => {
      let error;

      beforeAll(async () => {
        try {
          await core.networks(1).agendas.add(1);
        } catch (e) {
          error = e;
        }
      });

      it('error name is BadRequest', () => {
        expect(error.name).toBe('BadRequest');
      });

      it('error provides detailed message', () => {
        expect(error.message).toBe('agenda is already in the network');
      });
    });

  });

  describe('core.networks.agendas.remove', () => {

    describe('successful', () => {
      let result;

      beforeAll(async () => {
        result = await core.networks(1).agendas.remove(2);
      });

      it('result is updated agenda', () => {
        expect(result.uid).toBe(2);
      });

      it('network reference has been removed from agenda', () => {
        expect(result.networkUid).toBe(null);
      });

      it('db entry for agenda no longer holds network reference', async () => {
        const entry = await testConfig.knex('review')
          .first(['network_uid'])
          .where('uid', 2);

        expect(entry.network_uid).toBe(null);
      });
    });

    describe('fail for not being part of agenda', () => {
      let error;

      beforeAll(async () => {
        try {
          await core.networks(1).agendas.remove(11);
        } catch (e) {
          error = e;
        }
      });

      it('error name is BadRequest', () => {
        expect(error.name).toBe('BadRequest');
      });

      it('error provides detailed message', () => {
        expect(error.message).toBe('agenda is not in network');
      });
    });

  });

});
