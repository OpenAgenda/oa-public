const config = require( './testconfig' );

module.exports = {
  client: 'mysql',
  connection: config.mysql,
  migrations: config.migrations,
  schemas: config.schemas
};
