"use strict";

const _ = require( 'lodash' );

// simple dev db
const fixtures = require( './fixtures.json' );

// dev interface functions
const interfaces = require( './interfaces' )( fixtures );

module.exports = {
  interfaces: _.assign( {}, interfaces, {
    setNetworkSchemaFields
  } )
}

async function setNetworkSchemaFields( uid, fields ) {

  throw new Error( 'Could not save network schema' );

}
