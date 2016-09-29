"use strict";

module.exports = {
  identifiers: {
    check: checkIdentifiers,
    clean: cleanIdentifiers
  }
}


/**
 * do not proceed if clean identifiers amount to nothing
 */
function checkIdentifiers( v ) {

  if ( !Object.keys( v.identifiers ).length ) {

    throw 'No known identifiers specified for get';

  }

  return v;

}


/**
 * allow only certain fields for get ( id, uid and slug )
 */
function cleanIdentifiers( identifiers ) {

  let clean = {};

  if ( typeof identifiers !== 'object' ) {
    
    return {
      id: identifiers
    }

  }

  [ 'id', 'uid', 'slug' ].forEach( field => {

    if ( typeof identifiers[ field ] === 'undefined' ) return;

    clean[ field ] = identifiers[ field ];

  } );

  return clean;

}