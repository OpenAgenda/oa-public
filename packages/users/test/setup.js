import path from 'node:path';

import tmp from 'tmp';
import knexLib from 'knex';
import IORedis from 'ioredis';
import keysSvc from '@openagenda/keys/test/service/index.js';
import keysConfig from '@openagenda/keys/service/config.js';
import Files from '@openagenda/files';
import testconfig from '../testconfig.js';
import Service from '../service/index.js';

const { service: config, dependencies: dConfig } = testconfig;

const database = `${config.mysql.database}_service`;

const migrationDirectories = [
  path.resolve(import.meta.dirname, '../../keys/migrations'),
  path.resolve(import.meta.dirname, '../migrations'),
];

export const kaoreUid = 75052324;

let knex;
let redisClient;

export const getConfig = (options) => ({
  Model: knex,
  name: config.schemas.user,
  paginate: config.paginate,
  multi: true,
  interfaces: config.interfaces,
  imagePath: config.imagePath,
  schemas: config.schemas,
  Files: Files(dConfig.files),
  ...options,
});

export const getKnex = () => knex;

export { config, Service };

export function setupDatabase() {
  beforeEach(async () => {
    const bootstrap = knexLib({
      client: 'mysql2',
      connection: { ...config.mysql, database: null },
    });
    try {
      await bootstrap.raw(`DROP DATABASE IF EXISTS \`${database}\``);
      await bootstrap.raw(`CREATE DATABASE \`${database}\``);
    } finally {
      await bootstrap.destroy();
    }

    knex = knexLib({
      client: 'mysql2',
      connection: { ...config.mysql, database },
      schemas: config.schemas,
    });

    redisClient = new IORedis({
      host: config.redis.connection.host,
      port: config.redis.connection.port,
      maxRetriesPerRequest: null,
    });

    await keysSvc.init({
      ...config,
      knex,
      redis: { client: redisClient },
      migrations: null,
    });

    await knex.migrate.latest({ directory: migrationDirectories });
    await knex.seed.run({
      directory: path.join(import.meta.dirname, '../seeds'),
    });
  });

  afterEach(async () => {
    await knex.raw(`DROP DATABASE IF EXISTS \`${database}\`;`);
    await keysConfig.knex.destroy();
    await knex.destroy();
    await redisClient?.quit();
  });

  afterAll(() => tmp.setGracefulCleanup());
}

export function setupService() {
  let service;

  setupDatabase();

  beforeEach(() => {
    const conf = getConfig();

    const tokensService = new Service.Tokens({
      Model: conf.Model,
      name: conf.schemas.userToken,
      id: 'id',
      paginate: conf.paginate,
      interfaces: conf.interfaces,
    });

    service = new Service({
      ...conf,
      getTokensService: () => tokensService,
    });
  });

  return {
    getService: () => service,
  };
}
