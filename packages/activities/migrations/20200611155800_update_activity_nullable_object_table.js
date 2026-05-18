export const up = (knex) =>
  knex.raw(
    `ALTER TABLE \`${knex.client.config.schemas.activity}\` CHANGE \`object\` \`object\` VARCHAR(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL;`,
  );

export const down = (_knex) => {
  //
};
