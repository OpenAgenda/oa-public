"use strict";

const _ = require( 'lodash' );

module.exports = result => {

  const span = _.at( result, [ 'first.value_as_string', 'last.value_as_string' ] );

  let clean = {
    first: null,
    last: null
  }

  try {

    clean.first = new Date( span[ 0 ] );
    clean.last = new Date( span[ 1 ] );
    
  } catch ( e ) {

    return {
      first: null,
      last: null
    }

  }

  return clean;

}