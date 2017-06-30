"use strict"

const ih = require( 'immutability-helper' );

module.exports = ( settings, extensions ) => {

  let extended = {}

  Object.keys( extensions ).forEach( namespace => {

    extended[ namespace ] = {
      '$set' : extensions[ namespace ]
    }

  } );

  return ih( settings, { 
    mappings: {
      event: {
        properties: extended
      }
    }
  } )

}