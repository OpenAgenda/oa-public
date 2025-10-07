'use strict';

process.env.NODE_ENV = 'test';

const fs = require('node:fs');
const mysql = require('mysql2');

const Files = require('@openagenda/files');

const { service: config, dependencies: dConfig } = require('../testconfig');
const svc = require('../service/index');
const loadFixtures = require('./fixtures/load');

describe('agendas - functional (server): instanciate', () => {
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

  beforeEach(
    () =>
      new Promise((resolve) => {
        fs.createReadStream(`${__dirname}/files/rainfrog.jpg`)

          .pipe(fs.createWriteStream(`${__dirname}/files/tmp.jpg`))

          .on('close', () => {
            resolve();
          });
      }),
  );

  it('.getData - get public raw data', async () => {
    const agenda = await svc.get(4826, {
      instanciate: true,
      internal: true,
      private: true,
    });

    expect(agenda.getData().id).toBeUndefined();
  });

  it('.getData - get all raw data', async () => {
    const agenda = await svc.get(4826, {
      instanciate: true,
      internal: true,
      private: true,
    });

    expect(agenda.getData({ internal: true }).id).toBe(4826);
  });

  it('setImage - successful set saves image name in db', () => {
    const con = mysql.createConnection(config.mysql);

    const aId = 4922;

    return new Promise((resolve, reject) => {
      con.query('select * from agenda where id = ?', aId, (err, rows) => {
        if (err) return reject(err);
        expect(rows[0].image).toBeNull();

        svc.get(aId, { instanciate: true }, (err1) => {
          if (err1) return reject(err1);

          svc.set(
            aId,
            { image: { path: `${__dirname}/files/tmp.jpg` } },
            (err2) => {
              if (err2) return reject(err2);

              // Étape 3 : vérifier que l'image a été mise à jour correctement
              con.query(
                'select * from agenda where id = ?',
                aId,
                (err3, rows1) => {
                  if (err3) return reject(err3);
                  expect(rows1[0].image.split('?')[0]).toMatch(
                    new RegExp(`agenda${rows[0].uid}\\.[a-f0-9]{32}\\.jpg`),
                  );

                  resolve();
                },
              );
            },
          );
        });
      });
    }).finally(() => con.end());
  });

  it('getImage - default get is without path', async () => {
    const a = await svc.get(4820, { instanciate: true });

    expect(a.getImage().split('?')[0]).toBe(
      'review_planning-intervenants_00.jpg',
    );
  });

  it('getImage - get with true returns image name with path', async () => {
    const a = await svc.get(4820, { instanciate: true });

    expect(a.getImage(true)).toBe(
      'https://cdn.openagenda.com/dev/review_planning-intervenants_00.jpg',
    );
  });

  it('getImage - no image returns null', async () => {
    const a = await svc.get(4832, { instanciate: true });

    expect(a.getImage()).toBeNull();
    expect(a.getImage(true)).toBeNull();
  });

  it('getImage - no image returns default path if config allows this', async () => {
    svc.init({ ...config, useDefaultImage: true, Files: Files(dConfig.files) });

    const a = await svc.get(4832, { instanciate: true });

    expect(a.getImage(false, true)).toBe(config.defaultImagePath);

    expect(a.getImage(true, true)).toBe(config.defaultImagePath);

    svc.init({
      ...config,
      Files: Files(dConfig.files),
    });
  });
});
