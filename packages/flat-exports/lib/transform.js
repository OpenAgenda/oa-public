"use strict";

const _ = require( 'lodash' );
const flattener = require( 'flattener' );
const makeTransform = require( 'stream-utils' ).transform;

const base = [ {
  source: 'uid',
  target: 'uid'
} ];

module.exports = _.extend( ( options = {} ) => {

  const flatten = getFlattener( options );

  return makeTransform( flatten );  

}, {
  getFlattener
} );

function getFlattener( options ) {

  return flattener( base );

}