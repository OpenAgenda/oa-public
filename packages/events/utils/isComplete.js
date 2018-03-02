"use strict";

const validate = require( '../service/validate/front' );

/**
 * returns true if event is complete ( can be published ) and false if not ( can only be draft )
 */

module.exports = ( eventData, withErrors = false ) => {

  try {

    validate( eventData );

    return withErrors ? {
      complete: true,
      errors: []
    } : true;

  } catch( e ) {

    return withErrors ? {
      complete: false,
      errors: e
    } : false;

  }

}