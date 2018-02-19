"use strict";

const config = require( './config' );
const VError = require( 'verror' );

let log = console.log;

module.exports = async alias => {

  let { client } = config;

  let removedIndices = 0, toBeRemoved;

  if ( !await config.client.indices.existsAlias( { name: alias } ) ) {

    throw new VError( 'no index was found to be removed for alias %s', alias );

  }

  let indices = Object.keys( await config.client.indices.getAlias( { name: alias } ) );
  
  toBeRemoved = indices.length;

  while ( indices.length ) {

    let index = indices.pop();

    try {

      await client.indices.delete( { index } );

      removedIndices++;

    } catch( e ) {

      log( 'error', 'could not delete index %s of alias %s: %s', index, alias, e );

    }

  }

  return {
    success: true,
    removedIndices: indices.length
  }

}