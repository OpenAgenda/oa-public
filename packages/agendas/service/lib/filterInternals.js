"use strict";

module.exports = filterInternals;

function filterInternals( map, agenda, type = 'obj' ) {

  if ( !agenda ) return null;

  let filtered = {};

  map.forEach( field => {

    if ( typeof field !== 'string' && field.internal ) return;

    let fieldName = typeof field !== 'string' ? field[ type ] : field;

    filtered[ fieldName ] = agenda[ fieldName ];

  } );

  return filtered;

}