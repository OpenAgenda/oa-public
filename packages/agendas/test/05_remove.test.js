import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import mysql from 'mysql2';
import Files from '@openagenda/files';
import Agendas from '../service/index.js';
import testConfig from '../testconfig.js';
import loadFixtures from './fixtures/load.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

process.env.NODE_ENV = 'test';
const { service: config, dependencies: dConfig } = testConfig;

describe('agendas - functional (server): remove', () => {
  let svc;

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
  beforeAll(() => {
    svc = Agendas({
      ...config,
      Files: Files(dConfig.files),
    });
  });
  afterEach(() => {
    svc = Agendas({
      ...config,
      Files: Files(dConfig.files),
    });
  });

  it('agenda remove removes db entry', async () => {
    const con = mysql.createConnection(config.mysql);

    try {
      const [rows] = await con
        .promise()
        .query(`select id from ${config.schemas.agenda} where id = ?`, 4875);

      expect(rows.length).toBe(1);

      await svc.remove(4875);

      const [rows1] = await con
        .promise()
        .query(`select id from ${config.schemas.agenda} where id = ?`, 4875);

      expect(rows1.length).toBe(0);
    } finally {
      await con.end();
    }
  });

  it('agenda remove with private option set removes private db entry', async () => {
    const con = mysql.createConnection(config.mysql);

    try {
      const [rows] = await con
        .promise()
        .query(`select id from ${config.schemas.agenda} where id = ?`, 4826);

      expect(rows.length).toBe(1);

      await svc.remove(4826);

      const [rows1] = await con
        .promise()
        .query(`select id from ${config.schemas.agenda} where id = ?`, 4826);

      expect(rows1.length).toBe(0);
    } finally {
      await con.end();
    }
  });

  it('agenda remove calls interface callback beforeRemove and onRemove', async () => {
    // do this as part of unique init
    // do this as part of unique init
    svc = Agendas({
      ...config,
      Files: Files(dConfig.files),
      interfaces: {
        beforeRemove: (agenda, cb) => {
          expect(agenda.id).toBe(4830);
          cb();
        },
        onRemove: (agenda) => {
          expect(agenda.id).toBe(4830);
        },
      },
    });

    await svc.remove(4830);
  });
});
