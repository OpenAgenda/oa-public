"use strict";

const states = require( '../../iso/states' );

module.exports = ( state, isPublished ) => {

  if ( state === 2 ) {

    return states.PUBLISHED;

  }

  if ( state === 1 ) {

    return states.CONTROLLED;

  }

  if ( state === -1 ) {

    return states.REFUSED;

  }

  return states.TOCONTROL;

}
