"use strict";

const validate = require( '../service/validate/front' );

/**
 * returns true if event is complete ( can be published ) and false if not ( can only be draft )
 */

module.exports = eventData => {

  try {

    validate( eventData );

    return true;

  } catch( e ) {

    return false;

  }

}