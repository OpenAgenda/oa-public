import config from './testconfig.js';

export default {
  client: 'mysql',
  connection: config.mysql,
  migrations: config.migrations,
  schemas: config.schemas,
};
