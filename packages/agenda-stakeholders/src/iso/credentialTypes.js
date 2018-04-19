"use strict";

module.exports.types = [ {
  value: 0,
  code: 'anonymous' // not used
}, {
  value: 4,
  code: 'reader'
}, {
  value: 1,
  code: 'contributor'
}, {
  value: 3,
  code: 'moderator'
}, {
  value: 2,
  code: 'administrator'
} ];

module.exports.get = code => {

  let matches = module.exports.list( [ code ] );

  return matches.length ? matches[ 0 ] : undefined;

}

module.exports.list = codes => {

  return module.exports.types.filter( t => codes.indexOf( t.code ) !== -1 ).map( t => t.value );

}

module.exports.codes = {
  get: value => {

    let matches = listCodes( [ value ] );

    return matches.length ? matches[ 0 ] : undefined;

  },
  list: listCodes
}

module.exports.isSuperiorTo = ( cred, refCred, orEqual = false ) => {

  if ( cred === undefined ) cred = 1;

  let rankings = [ -1, -1 ];

  module.exports.types.forEach( ( t, i ) => {

    if ( t.value === refCred ) rankings[ 1 ] = i;

    if ( t.value === cred ) rankings[ 0 ] = i;

  } );

  return orEqual ? rankings[ 0 ] >= rankings[ 1 ] : rankings[ 0 ] > rankings[ 1 ];

}

function listCodes( values ) {

  return module.exports.types.filter( t => values.indexOf( t.value ) !== -1 ).map( t => t.code );  

}
