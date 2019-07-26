"use strict";

const _ = require( 'lodash' );

// simple dev db
const fixtures = require( './fixtures.json' );

// dev interface functions
const interfaces = require( './interfaces' )( fixtures );

module.exports = {
  interfaces: _.assign( {}, interfaces, {
    addAgendaToNetwork
  } )
}

async function addAgendaToNetwork( uid, slug ) {

  throw new Error( 'Could not add agenda' );

}
