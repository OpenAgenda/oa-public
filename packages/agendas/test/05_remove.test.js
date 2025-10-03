'use strict';

process.env.NODE_ENV = 'test';

const mysql = require('mysql2');
const Files = require('@openagenda/files');

const svc = require('../service/index');
const { service: config, dependencies: dConfig } = require('../testconfig');
const loadFixtures = require('./fixtures/load');

describe('agendas - functional (server): remove', () => {
  beforeAll(
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
      },
    }),
  );

  beforeAll(() =>
    svc.init({
      ...config,
      Files: Files(dConfig.files),
    }));

  afterEach(() =>
    svc.init({
      ...config,
      Files: Files(dConfig.files),
    }));

  it('agenda remove removes db entry', () => {
    const con = mysql.createConnection(config.mysql);

    return new Promise((resolve, reject) => {
      con.query(
        `select id from ${config.schemas.agenda} where id = ?`,
        4875,
        (err, rows) => {
          if (err) return reject(err);

          expect(rows.length).toBe(1);

          svc.remove(4875, (err1) => {
            if (err1) return reject(err1);

            con.query(
              `select id from ${config.schemas.agenda} where id = ?`,
              4875,
              (err2, rows1) => {
                if (err2) return reject(err2);

                expect(rows1.length).toBe(0);

                resolve();
              },
            );
          });
        },
      );
    }).finally(() => con.end());
  });

  it('agenda remove with private option set removes private db entry', () => {
    const con = mysql.createConnection(config.mysql);

    return new Promise((resolve, reject) => {
      con.query(
        `select id from ${config.schemas.agenda} where id = ?`,
        4826,
        (err, rows) => {
          if (err) return reject(err);

          expect(rows.length).toBe(1);

          svc.remove(4826, (err1) => {
            if (err1) return reject(err1);

            con.query(
              `select id from ${config.schemas.agenda} where id = ?`,
              4826,
              (err2, rows1) => {
                if (err2) return reject(err2);

                expect(rows1.length).toBe(0);

                resolve();
              },
            );
          });
        },
      );
    }).finally(() => con.end());
  });

  it('agenda remove calls interface callback beforeRemove and onRemove', () =>
    new Promise((resolve) => {
      // do this as part of unique init
      svc.init({
        ...config,
        Files: Files(dConfig.files),
        interfaces: {
          beforeRemove: (agenda, cb) => {
            expect(agenda.id).toBe(4830);

            cb();
          },
          onRemove: (agenda) => {
            expect(agenda.id).toBe(4830);

            resolve();
          },
        },
      });

      svc.remove(4830, () => {});
    }));
});
