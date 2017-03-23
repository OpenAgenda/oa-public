"use strict";

const _ = require( 'lodash' ),

  contextValidator = require( '../../iso/contextValidator' );

module.exports = function( context, cb ) {

  let cleanContext;

  try {

    cleanContext = contextValidator( context );

  } catch( e ) {

    return cb( null, false, null, e );

  }

  return cb( null, true, cleanContext );

}