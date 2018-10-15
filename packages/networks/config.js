"use strict";

const _ = require( 'lodash' );

const config = {
  knex: null, // required
  schema: 'network'
};

module.exports = _.assign( config, { init } );

function init( c ) {

  config.knex = c.knex;

}
