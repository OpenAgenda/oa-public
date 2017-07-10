"use strict";

const _ = require( 'lodash' );

const knexLib = require( 'knex' );

const config = {
  knex: null
};

module.exports = _.extend( config, { init } );

function init( c ) {

  if ( !c.knex ) {

    config.knex = knexLib( {
      client: 'mysql',
      connection: c.mysql
    } );

  }

  _.extend( config, _.pick( c, [ 
    'knex', 
    'schemas',
    'interfaces'
  ] ) );

}
