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
  frontAppPath: '/js/index.js',
  knex: knex( {
    client: 'mysql',
    // leave database name out of connection for tests only
    connection: _.omit( connection, 'database' )
  } ),
  schema: 'survey',
  test: {
    connection
  },
  decorateKey: 'decorateWith', // inject data before create
  layout: fs.readFileSync( __dirname + '/index.ejs', 'utf-8' ),
}