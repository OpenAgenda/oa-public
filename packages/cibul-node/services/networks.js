"use strict";

const networks = require( '@openagenda/networks' );

module.exports.init = config => {

  networks.init( {
    knex: config.knex
  } );

}
