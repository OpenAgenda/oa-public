"use strict";

const _ = require( 'lodash' );

// simple dev db
const fixtures = require( './fixtures.json' );

// dev interface functions
const interfaces = require( './interfaces' )( fixtures );

module.exports = {
  interfaces: _.assign( {}, interfaces, {
    getNetworkSchema
  } )
}

async function getNetworkSchema( uid ) {

  throw new Error( 'Could not load network details' );

}
