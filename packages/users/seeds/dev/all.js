'use strict';

const path = require('path');
const { promisify } = require('util');
const fixtures = require('@openagenda/fixtures');

exports.seed = async knex => {
  const { connection, schemas } = knex.client.config;

  fixtures.init({
    mysql: connection
  });

  await promisify(fixtures)(
    [
      {
        table: schemas.user,
        src: path.resolve(__dirname, 'user.sql')
      },
      {
        table: schemas.key,
        src: path.resolve(__dirname, 'key.sql')
      }
    ],
    { reset: false }
  );
};
