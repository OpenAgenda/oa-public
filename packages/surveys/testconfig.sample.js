"use strict";

const _ = require( 'lodash' );
const knex = require( 'knex' );
const fs = require( 'fs' );

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
  decorateKey: 'decorateWith', // inject data before create
  layout: fs.readFileSync( __dirname + '/index.ejs', 'utf-8' ),

  // only useful for dev environment
  test: {
    connection
  },
}