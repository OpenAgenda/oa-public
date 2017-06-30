"use strict";

const validateText = require( 'validators/text' )();

let log = console.log;

module.exports = customQuery => {

  let cleanObj = {};

  if ( !customQuery || typeof customQuery !== 'object' ) {

    return null;

  }

  Object.keys( customQuery ).forEach( fieldName => {

    try {

      cleanObj[ fieldName ] = validateText( customQuery[ fieldName ] );

    } catch ( e ) {

      log( 'error', new Error( e ) );

    }

  } );

  return cleanObj;

}