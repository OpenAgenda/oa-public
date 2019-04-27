"use strict";

const _ = require( 'lodash' );

const Networks = require( '@openagenda/networks' );

module.exports.init = config => {

  const networks = Networks( {
    knex: config.knex
  } );

  _.assign( module.exports, networks );

}
