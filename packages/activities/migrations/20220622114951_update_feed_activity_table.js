export const up = (knex) => {
  const { schemas } = knex.client.config;

  return knex.raw(
    `ALTER TABLE ${schemas.feed_activity} CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;`,
  );
};

export const down = (_knex) => {
  //
};
