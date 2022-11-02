exports.up = knex => {
  const schemas = knex.client.config.schemas;

  return knex.raw( `ALTER TABLE ${schemas.feed_activity} CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;` );
};

exports.down = knex => {
  //
};
