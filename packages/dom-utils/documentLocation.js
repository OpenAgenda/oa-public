"use strict";

var qs = require( 'qs' );

module.exports = {
  getQuery: getQuery,
  getQueryPart: getQueryPart,
  setQueryPart: setQueryPart
};


function getQuery() {

  if ( !document ) return;

  var parts = document.location.href.split( '?' ), query;

  if ( parts.length < 2 ) return;

  query = parts[ 1 ].split( '#' )[ 0 ];

  if ( !query.length ) return;

  return qs.parse( query );

}


function getQueryPart( name, defaultValue ) {

  if ( !document ) return defaultValue;

  var parts = document.location.href.split( '?' ), query;

  if ( parts.length < 2 ) return defaultValue;

  query = parts[ 1 ].split( '#' )[ 0 ];

  if ( !query.length ) return defaultValue;

  query = qs.parse( query );

  if ( query[ name ] === undefined ) return defaultValue;

  return query[ name ];

}

function setQueryPart( query ) {

  if ( typeof window.history !== 'undefined' && typeof window.history.pushState !== 'undefined' ) {

    let q = qs.stringify( query );
      
    window.history.pushState( query, '',
      window.location.href.split( '?' )[ 0 ] + ( q ? '?' + q : '' )
    );

  }

}