"use strict";

const _ = require( 'lodash' );
const knex = require( 'knex' );

const connection = {
  database: 'oatest_surveys',
  user: 'root',
  password: 'grut'
}

module.exports = {
  knex: knex( {
    client: 'mysql',
    // leave database name out of connection for tests only
    connection: _.omit( connection, 'database' )
  } ),
  schema: 'survey',
  test: {
    connection
  }
}