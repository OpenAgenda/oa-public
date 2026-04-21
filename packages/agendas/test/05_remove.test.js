import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import mysql from 'mysql2';
import Files from '@openagenda/files';
import IORedis from 'ioredis';
import Agendas from '../service/index.js';
import testConfig from '../testconfig.js';
import loadFixtures from './fixtures/load.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

process.env.NODE_ENV = 'test';
const { service: config, dependencies: dConfig } = testConfig;

describe('agendas - functional (server): remove', () => {
  let svc;
  let redisClient;

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
  beforeAll(async () => {
    redisClient = new IORedis(dConfig.redis);
    await redisClient.del('agendaSlugUnicity');
    await redisClient.del('agendaSlugUnicity:lock');
    await redisClient.del('agendaUidUnicity');
    await redisClient.del('agendaUidUnicity:lock');
  });
  beforeAll(() => {
    svc = Agendas({
      ...config,
      Files: Files(dConfig.files),
      redis: redisClient,
    });
  });
  afterEach(() => {
    svc = Agendas({
      ...config,
      Files: Files(dConfig.files),
      redis: redisClient,
    });
  });
  afterAll(async () => {
    await redisClient.quit();
  });

  it('agenda remove is a soft delete', async () => {
    const con = mysql.createConnection(config.mysql);

    try {
      const [rows] = await con
        .promise()
        .query(
          `select id, deleted_at from ${config.schemas.agenda} where id = ?`,
          4875,
        );

      expect(rows.length).toBe(1);
      expect(rows[0].deleted_at).toBeNull();

      await svc.remove(4875);

      const [rows1] = await con
        .promise()
        .query(
          `select id, deleted_at from ${config.schemas.agenda} where id = ?`,
          4875,
        );

      expect(rows1.length).toBe(1);
      expect(rows1[0].deleted_at).toBeInstanceOf(Date);
    } finally {
      await con.end();
    }
  });

  it('soft-deleted agenda is not returned by get with default options', async () => {
    const agenda = await svc.get(4875, { internal: true, private: null });
    expect(agenda).toBeNull();
  });

  it('soft-deleted agenda is returned by get with deleted: true', async () => {
    const agenda = await svc.get(4875, {
      deleted: true,
      internal: true,
      private: null,
    });
    expect(agenda).not.toBeNull();
    expect(agenda.id).toBe(4875);
  });

  it('soft-deleted agenda is returned by get with deleted: null', async () => {
    const agenda = await svc.get(4875, {
      deleted: null,
      internal: true,
      private: null,
    });
    expect(agenda).not.toBeNull();
    expect(agenda.id).toBe(4875);
  });

  it('agenda remove with private option soft deletes private db entry', async () => {
    const con = mysql.createConnection(config.mysql);

    try {
      const [rows] = await con
        .promise()
        .query(
          `select id, deleted_at from ${config.schemas.agenda} where id = ?`,
          4826,
        );

      expect(rows.length).toBe(1);
      expect(rows[0].deleted_at).toBeNull();

      await svc.remove(4826);

      const [rows1] = await con
        .promise()
        .query(
          `select id, deleted_at from ${config.schemas.agenda} where id = ?`,
          4826,
        );

      expect(rows1.length).toBe(1);
      expect(rows1[0].deleted_at).toBeInstanceOf(Date);
    } finally {
      await con.end();
    }
  });

  it('slug of a soft-deleted agenda can be reused on a new create', async () => {
    const con = mysql.createConnection(config.mysql);

    try {
      const [rows] = await con
        .promise()
        .query(`select slug from ${config.schemas.agenda} where id = ?`, 4818);
      const { slug: reusedSlug } = rows[0];

      await svc.remove(4818);

      const result = await svc.set({
        ownerId: 12,
        title: 'Reuse slug',
        description: 'Reusing a soft-deleted slug',
        slug: reusedSlug,
      });

      expect(result.errors).toEqual([]);
      expect(result.success).toBe(true);
      expect(result.agenda.slug).toBe(reusedSlug);
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
