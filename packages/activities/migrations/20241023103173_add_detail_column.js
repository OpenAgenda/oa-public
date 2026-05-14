export const up = (knex) => {
  const { schemas } = knex.client.config;

  return knex.raw(`ALTER TABLE ${schemas.activity} add detail longtext;`);
};

export const down = (_knex) => {
  //
};
