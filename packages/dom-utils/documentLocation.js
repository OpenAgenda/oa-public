"use strict";

var qs = require( 'qs' );

module.exports.getQueryPart = function( name, defaultValue ) {

  if ( !document ) return defaultValue;

  var parts = document.location.href.split( '?' ), query;

  if ( parts.length < 2 ) return defaultValue;

  query = parts[ 1 ].split( '#' )[ 0 ];

  if ( !query.length ) return defaultValue;

  query = qs.parse( query );

  if ( query[ name ] === undefined ) return defaultValue;

  return query[ name ];

}