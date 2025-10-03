import testconfig from './testconfig.js';

// Useful for the knex CLI

export default {
  client: 'mysql2',
  connection: testconfig.mysql,
  schemas: testconfig.schemas,
  seeds: {
    directory: './seeds/dev',
  },
};
