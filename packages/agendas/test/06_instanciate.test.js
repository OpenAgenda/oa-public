import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import fs from 'node:fs';
import mysql from 'mysql2';
import Files from '@openagenda/files';

import testConfig from '../testconfig.js';
import Agendas from '../service/index.js';
import loadFixtures from './fixtures/load.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

process.env.NODE_ENV = 'test';
const { service: config, dependencies: dConfig } = testConfig;

describe('agendas - functional (server): instanciate', () => {
  let svc;
  beforeAll(() => {
    svc = Agendas({
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

  it('setImage - successful set saves image name in db', async () => {
    const con = mysql.createConnection(config.mysql);

    const aId = 4922;

    try {
      const rows = await new Promise((resolve, reject) => {
        con.query('select * from agenda where id = ?', aId, (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
      });

      expect(rows[0].image).toBeNull();

      await svc.get(aId, { instanciate: true });

      await svc.set(aId, { image: { path: `${__dirname}/files/tmp.jpg` } });

      // Check that the image was updated correctly
      const rows1 = await new Promise((resolve, reject) => {
        con.query('select * from agenda where id = ?', aId, (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
      });

      expect(rows1[0].image.split('?')[0]).toMatch(
        new RegExp(`agenda${rows[0].uid}.[a-f0-9]{32}.jpg`),
      );
    } finally {
      con.end();
    }
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
    svc = Agendas({
      ...config,
      useDefaultImage: true,
      Files: Files(dConfig.files),
    });

    const a = await svc.get(4832, { instanciate: true });

    expect(a.getImage(false, true)).toBe(config.defaultImagePath);

    expect(a.getImage(true, true)).toBe(config.defaultImagePath);

    svc = Agendas({
      ...config,
      Files: Files(dConfig.files),
    });
  });
});
