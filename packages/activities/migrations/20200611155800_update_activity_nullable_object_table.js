exports.up = knex => {

  return knex.raw(`ALTER TABLE \`${knex.client.config.schemas.activity}\` CHANGE \`object\` \`object\` VARCHAR(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL;`);

};

exports.down = knex => {

  //

};
