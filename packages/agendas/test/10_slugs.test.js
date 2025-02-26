'use strict';

process.env.NODE_ENV = 'test';

const Files = require('@openagenda/files');

const { service: config, dependencies: dConfig } = require('../testconfig');
const svc = require('../service/index');
const loadFixtures = require('./fixtures/load');

describe('agendas - functional (server): slugs', () => {
  beforeAll(() => {
    svc.init({
      ...config,
      Files: Files(dConfig.files),
    });
  });

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

  describe('isTaken', () => {
    it('finds that slug is taken', () =>
      new Promise((resolve, reject) => {
        svc.slugs.isTaken('agenda-culturel-auvergne', (err, result) => {
          if (err) return reject(err);

          expect(result).toEqual({
            taken: true,
            valid: true,
            errors: [],
          });

          resolve();
        });
      }));

    it('finds that slug is not taken', () =>
      new Promise((resolve, reject) => {
        svc.slugs.isTaken('tapetonslugunique', (err, result) => {
          if (err) return reject(err);

          expect(result).toEqual({
            taken: false,
            valid: true,
            errors: [],
          });

          resolve();
        });
      }));

    it('finds that slug is not valid', () =>
      new Promise((resolve, reject) => {
        svc.slugs.isTaken('This is not a slug', (err, result) => {
          if (err) return reject(err);

          expect(result).toEqual({
            taken: null,
            valid: false,
            errors: [
              {
                code: 'slug.invalid',
                message:
                  'only small case characters, numbers or dashes are allowed',
                origin: 'This is not a slug',
              },
            ],
          });

          resolve();
        });
      }));
  });
});
