"use strict";

const validateText = require( 'validators/text' )();
const validateInteger = require( 'validators/integer' )();

let log = console.log;

module.exports = extensionQuery => {

  let cleanObj = {};

  if ( !extensionQuery || typeof extensionQuery !== 'object' ) {

    return null;

  }

  Object.keys( extensionQuery ).forEach( fieldName => {

    const dirty = extensionQuery[ fieldName ];

    for( let validate of [ validateInteger, validateText ] ) {

      try {

        cleanObj[ fieldName ] = validate( dirty );

        return;

      } catch ( e ) {}

    }


  } );

  return cleanObj;

}