"use strict";

const _ = require( 'lodash' );
const w = require( 'when' );

module.exports = function( aliasNamespace, namespace, v ) {

  let d = w.defer();

  let [ client, alias ] = _.at( v, [ 'client', aliasNamespace ] );

  client.indices.getAlias( { name: alias }, ( err, result ) => {

    if ( err && err.status === 404 ) return d.resolve( v );

    if ( err ) return d.reject( err );

    let indices = Object.keys( result );

    if ( !indices.length ) return d.resolve( v );

    _.set( v, namespace, indices[ 0 ] );

    d.resolve( v );

  } );

  return d.promise;

}