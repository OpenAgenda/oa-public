"use strict";

const validate = require( './validate' ),

  set = require( 'lodash/set' ),

  extend = require( 'lodash/extend' ),

  buildDsl = require( './buildDsl' );

module.exports = extend( queryToDsl, { pre } );

function queryToDsl( query, nav ) {

  let preParsed = pre( query );

  let clean = validate( preParsed );

  return buildDsl( clean, nav );

}

function pre( query ) {

  let preParsed = {};

  Object.keys( query ).forEach( key => {

    if ( key.indexOf( '.' ) !== -1 ) {

      set( preParsed, key, query[ key ] );

    } else {

      preParsed[ key ] = query[ key ];

    }

  } );

  return preParsed;

}