"use strict";

const _ = require( 'lodash' );

const networks = require( '@openagenda/networks' );

module.exports.init = config => {

  _.assign( module.exports, networks( {
    knex: config.knex
  } ) );

}
