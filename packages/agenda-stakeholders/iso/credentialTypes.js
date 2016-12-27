"use strict";

module.exports.types = [ {
  value: 0,
  code: 'anonymous' // not used
}, {
  value: 1,
  code: 'contributor'
}, {
  value: 2,
  code: 'administrator'
}, {
  value: 3,
  code: 'moderator'
}, {
  value: 4,
  code: 'reader'
} ];

module.exports.get = code => {

  let matches = module.exports.list( [ code ] );

  return matches.length ? matches[ 0 ] : undefined;

}

module.exports.list = codes => {

  return module.exports.types.filter( t => codes.indexOf( t.code ) !== -1 ).map( t => t.value );

}