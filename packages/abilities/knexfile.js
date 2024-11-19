import testconfig from './testconfig.js';

// Useful for the knex CLI

export default {
  client: 'mysql',
  connection: testconfig.mysql,
  schemas: testconfig.schemas,
  seeds: {
    directory: './seeds/dev',
  },
};
