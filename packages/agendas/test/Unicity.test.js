import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import fs from 'node:fs';
import IORedis from 'ioredis';
import slugify from 'slugify';
import Unicity from '../service/lib/Unicity/index.js';
import setup from './fixtures/setup.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// need to throw an exception after max retries on slug generation

const mysqlConnection = {
  host: process.env.OA_MYSQL_DEV_HOST,
  user: process.env.OA_MYSQL_DEV_USER,
  password: process.env.OA_MYSQL_DEV_PASSWORD,
  charset: 'utf8mb4',
  jsonStrings: true,
  ssl: parseInt(process.env.OA_MYSQL_DEV_SSL_VERIFY, 10)
    ? {
      ca: fs.readFileSync(process.env.OA_MYSQL_DEV_SSL_CA),
      cert: fs.readFileSync(process.env.OA_MYSQL_DEV_SSL_CERT),
      key: fs.readFileSync(process.env.OA_MYSQL_DEV_SSL_KEY),
    }
    : { rejectUnauthorized: false },
};

describe('Unicity', () => {
  let knexClient;
  let redisClient;
  let unicity;

  beforeAll(async () => {
    knexClient = await setup({
      mysql: { ...mysqlConnection, database: 'unicity_test' },
      schemas: { agenda: 'agenda' },
      data: [`${__dirname}/fixtures/agenda.data.sql`],
    });

    redisClient = new IORedis({
      port: process.env.REDIS_PORT ?? 6379,
      host: process.env.REDIS_HOST ?? 'localhost',
      maxRetriesPerRequest: null,
    });
    await redisClient.del('unicity');

    unicity = Unicity('agenda.slug', {
      setName: 'unicity',
      expiry: 1000,
      client: knexClient,
      redis: redisClient,
      generate: (seed, randomize = false) => {
        const slug = slugify(seed || '', { lower: true, strict: true });
        return randomize ? `${slug}-${Math.ceil(Math.random() * 1000)}` : slug;
      },
    });
  });

  afterAll(async () => {
    await unicity.destroy();
    await knexClient.destroy();
    await redisClient.quit();
  });

  describe('.get', () => {
    test('gets the held value', async () => {
      await unicity.generateAndHold('what-a-fine-bucket-stanley');

      expect(await unicity.get()).toBe('what-a-fine-bucket-stanley');
    });
  });

  describe('.release', () => {
    test('returns true if a value was released', async () => {
      await unicity.generateAndHold('value');

      expect(await unicity.release()).toBe(true);
    });

    test('returns false if no value was released', async () => {
      expect(await unicity.release()).toBe(false);
    });
  });

  describe('.clone', () => {
    test('creates another instance of Unicity with the same configuration but initialized and holding no value', async () => {
      await unicity.generateAndHold('super-unique-slug');

      const otherUnicity = unicity.clone();

      expect(await otherUnicity.get()).toBeNull();
    });
  });

  describe('.isAvailable', () => {
    test('if entry is found in table with provided value, returns false', async () => {
      expect(await unicity.isAvailable('la-forge-campus')).toBe(false);
    });

    test('if value is already held by other instance, returns false', async () => {
      const otherUnicity = unicity.clone();

      await otherUnicity.generateAndHold('some-very-unique-slug');

      expect(await unicity.isAvailable('some-very-unique-slug')).toBe(false);

      await otherUnicity.destroy();
    });
  });

  describe('.generateAndHold', () => {
    let slug;

    beforeAll(async () => {
      slug = await unicity.generateAndHold('another-unique-slug');
    });

    test('returns a unique available value', () => {
      expect(slug).toBe('another-unique-slug');
    });

    test('held value is stored locally in instance javascript memory', async () => {
      expect(await unicity.get()).toBe('another-unique-slug');
    });

    test('held value is stored in redis set', async () => {
      expect(await redisClient.sismember('unicity', slug)).toBe(1);
    });

    test('held value is not available for other instance', async () => {
      const otherUnicity = unicity.clone();

      const otherSlug = await otherUnicity.generateAndHold(
        'another-unique-slug',
      );

      expect(otherSlug).not.toBe('another-unique-slug');

      await otherUnicity.destroy();
    });

    test('unicity is garanteed in competing instances', async () => {
      const unicities = [unicity, unicity.clone(), unicity.clone()];
      const result = await Promise.all(
        unicities.map((u) => u.generateAndHold('super-duper-unique-slug')),
      );

      expect(result.filter((r) => r === 'super-duper-unique-slug').length).toBe(
        1,
      );

      expect(
        result.filter((r) => r.includes('super-duper-unique-slug-')).length,
      ).toBe(2);
    });
  });

  describe('filter option', () => {
    let filteredUnicity;

    beforeAll(async () => {
      await knexClient('agenda')
        .where('slug', 'la-forge-campus')
        .update({ deleted_at: new Date() });

      filteredUnicity = Unicity('agenda.slug', {
        setName: 'unicity-filtered',
        expiry: 1000,
        client: knexClient,
        redis: redisClient,
        generate: (seed, randomize = false) => {
          const slug = slugify(seed || '', { lower: true, strict: true });
          return randomize
            ? `${slug}-${Math.ceil(Math.random() * 1000)}`
            : slug;
        },
        filter: (q) => q.whereNull('deleted_at'),
      });

      await redisClient.del('unicity-filtered');
    });

    afterAll(async () => {
      await filteredUnicity.destroy();
      await knexClient('agenda')
        .where('slug', 'la-forge-campus')
        .update({ deleted_at: null });
    });

    test('isAvailable ignores soft-deleted rows', async () => {
      expect(await filteredUnicity.isAvailable('la-forge-campus')).toBe(true);
    });

    test('holdIfAvailable holds a slug used only by soft-deleted rows', async () => {
      const held = filteredUnicity.clone();
      try {
        expect(await held.holdIfAvailable('la-forge-campus')).toBe(true);
      } finally {
        await held.destroy();
      }
    });

    test('generateAndHold returns the natural slug when only a soft-deleted row exists', async () => {
      const held = filteredUnicity.clone();
      try {
        const slug = await held.generateAndHold('La Forge Campus');
        expect(slug).toBe('la-forge-campus');
      } finally {
        await held.destroy();
      }
    });

    test('without filter, the same value is unavailable', async () => {
      expect(await unicity.isAvailable('la-forge-campus')).toBe(false);
    });
  });
});
