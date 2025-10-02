'use strict';

process.env.NODE_ENV = 'test';

const mysql = require('mysql2');
const Files = require('@openagenda/files');

const { service: config, dependencies: dConfig } = require('../testconfig');
const legacy = require('../service/legacy/index');
const svc = require('../service/index');
const loadFixtures = require('./fixtures/load');

describe('agendas - unit (server): legacy bridging', () => {
  beforeAll(() =>
    svc.init({
      ...config,
      Files: Files(dConfig.files),
    }));

  beforeEach(
    loadFixtures.bind(null, {
      mysql: config.mysql,
      files: [
        `${__dirname}/fixtures/resetDb.sql`,
        `${__dirname}/../model.sql`,
        `${__dirname}/fixtures/agenda.data.sql`,
        `${__dirname}/fixtures/agendaEvent.data.sql`,
      ],
      map: {
        database: config.mysql.database,
        agenda: 'agenda',
        agendaEvent: 'agenda_event',
        legacyCredential: 'legacy_credential_set',
      },
    }),
  );

  describe('applyToLegacy', () => {
    it('contribution default state is written in store', () => {
      const con = mysql.createConnection(config.mysql);

      return new Promise((resolve, reject) => {
        con.query('select store from agenda where id = 4818', (err, rows) => {
          if (err) return reject(err);

          const currentStore = JSON.parse(rows[0].store);

          expect(currentStore.moderated).toBe(false);

          legacy(4818).applyToLegacy(
            {
              settings: {
                contribution: {
                  defaultState: 0,
                },
              },
            },
            (err1) => {
              if (err1) return reject(err1);
              con.query(
                'select store from agenda where id = 4818',
                (err2, rows1) => {
                  if (err2) return reject(err2);
                  expect(JSON.parse(rows1[0].store).moderated).toBe(true);
                  resolve();
                },
              );
            },
          );
        });
      }).finally(() => con.end());
    });
  });
});
