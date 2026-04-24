import config from './testconfig.js';

export default {
  client: 'mysql2',
  connection: config.mysql,
  schemas: config.schemas,
};
