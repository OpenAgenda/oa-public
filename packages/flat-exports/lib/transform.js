"use strict";

const makeTransform = require( 'stream-utils' ).transform;
const flattener = require( 'flattener' );

const base = [ {
  source: 'uid',
  target: 'uid'
} ]

module.exports = options = {} => {

  const flatten = getFlattener( options );

  return makeTransform( flatten );  

}

module.exports.getFlattener = function getFlattener( options ) {

  return flattener( base );

}