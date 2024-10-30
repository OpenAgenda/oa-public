'use strict';

exports.up = (knex) => {
  const { schemas } = knex.client.config;

  return knex.raw(`ALTER TABLE ${schemas.activity} add detail longtext;`);
};

exports.down = (_knex) => {
  //
};
