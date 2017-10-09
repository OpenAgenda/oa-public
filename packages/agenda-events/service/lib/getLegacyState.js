"use strict";

const states = require( '../../iso/states' );

module.exports = ( state, isPublished ) => {

  if ( isPublished ) {

    return states.PUBLISHED;

  }

  if ( state === 1 ) {

    return states.CONTROLLED;

  }

  return states.TOCONTROL;

}