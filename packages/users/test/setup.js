import path from 'node:path';

import tmp from 'tmp';
import knexLib from 'knex';
import keysSvc from '@openagenda/keys/test/service/index.js';
import keysConfig from '@openagenda/keys/service/config.js';
import Files from '@openagenda/files';
import testconfig from '../testconfig.js';
import Service from '../service/index.js';

const { service: config, dependencies: dConfig } = testconfig;

const database = `${config.mysql.database}_service`;

export const kaoreUid = 75052324;

let knex;

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
    knex = knexLib({
      client: 'mysql2',
      connection: { ...config.mysql, database: null },
      schemas: config.schemas,
    });

    await knex.raw(`DROP DATABASE IF EXISTS ${database};`);
    await knex.raw(`CREATE DATABASE ${database};`);
    await knex.raw(`USE ${database};`);

    knex.client.connectionSettings.database = database;

    await keysSvc.init({
      ...config,
      knex,
      mysql: { ...config.mysql, database },
      migrations: null,
    });

    await knex.migrate.latest({
      directory: path.join(import.meta.dirname, '../../keys/migrations'),
      tableName: 'knex_migrations_keys',
    });
    await knex.migrate.latest({
      directory: path.join(import.meta.dirname, '../migrations'),
    });
    await knex.seed.run({
      directory: path.join(import.meta.dirname, '../seeds'),
    });
  });

  afterEach(async () => {
    await knex.raw(`DROP DATABASE IF EXISTS \`${database}\`;`);
    await keysConfig.knex.destroy();
    await knex.destroy();
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
