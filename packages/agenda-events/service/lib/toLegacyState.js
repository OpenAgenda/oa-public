"use strict";

const states = require( '../../iso/states' );

module.exports = state => {

  let isPublished = false;
  let legacyState = 0;

  if ( state === states.PUBLISHED ) {

    isPublished = true;
    legacyState = 2;

  } else if ( state === states.CONTROLLED ) {

    legacyState = 1;

  } else if ( state === states.REFUSED ) {

    legacyState = -1;

  } else {

    legacyState = 0;

  }

  return {
    state: legacyState,
    isPublished
  }

}
