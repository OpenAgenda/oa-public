"use strict";

const _ = require( 'lodash' );
const w = require( 'when' );
const VError = require( 'verror' )

module.exports = function( aliasNamespace, indexNamespace, v ) {

  let d = w.defer();

  let [ client, alias, indexName ] = _.at( v, [ 'client', aliasNamespace, indexNamespace ] );

  client.indices.putAlias( {
    index: indexName,
    name: alias
  }, ( err, result ) => {

    if ( err ) return d.reject( err );

    d.resolve( v );
    
  } );

  return d.promise;

}