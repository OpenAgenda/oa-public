"use strict";

const _ = require( 'lodash' );

// simple dev db
const fixtures = require( './fixtures.json' );

// dev interface functions
const interfaces = require( './interfaces' )( fixtures );

module.exports = {
  interfaces: _.assign( {}, interfaces, {
    getNetworkAgendas
  } )
}

async function getNetworkAgendas( uid ) {

  throw new Error( 'Could not load network agendas' );

}
