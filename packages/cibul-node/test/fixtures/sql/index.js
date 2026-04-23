import Knex from 'knex';

export const knex = Knex({
  client: 'mysql2',
});
