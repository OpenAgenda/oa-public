"use strict";

const schema = require( '@openagenda/validators/schema' );

schema.register( {
  integer: require( '@openagenda/validators/integer' ),
  regex: require( '@openagenda/validators/regex' )
} );


module.exports = nav => {

  let clean = navValidator( nav );

  if ( clean.scroll ) {

    return {
      scroll: clean.scroll,
      size: clean.size
    }

  }

  return {
    from: clean.from,
    size: clean.size
  }

}


let navValidator = schema( {
  scroll: {
    type: 'regex',
    optional: true,
    regex: /^[0-9]([0-9])m$/ 
  },
  from: {
    type: 'integer',
    optional: true,
    default: 0
  },
  size: {
    type: 'integer',
    optional: true,
    default: 20
  }
} );