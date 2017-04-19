"use strict";

const _ = require( 'lodash' );
const w = require( 'when' );

module.exports = function( namespace, v ) {

  let d = w.defer();

  let [ client, indexName ] = _.at( v, [ 'client', namespace ] );

  if ( !indexName ) return v;

  client.indices.delete( { index: indexName }, ( err, result ) => {

    if ( err ) return d.reject( err );

    d.resolve( v );

  } );

  return d.promise;

}