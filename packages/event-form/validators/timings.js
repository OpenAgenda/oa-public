"use strict";

const schema = require( '@openagenda/validators/schema' );

const _ = {
  isArray: require( 'lodash/isArray' ),
  extend: require( 'lodash/extend' )
}

schema.register( {
  date: require( '@openagenda/validators/date' )
} );

const validateTiming = schema( {
  begin: {
    type: 'date',
    optional: false
  },
  end: {
    type: 'date',
    optional: false
  }
} );


module.exports = () => value => {

  if ( !_.isArray( value ) || !value.length ) {

    throw [ {
      code: 'timings.empty',
      message: 'At least one timing is required',
      field: 'timings'
    } ];

  }

  const { errors, clean } = value.reduce( ( carry, value, index ) => {

    try {

      const cleanTiming = validateTiming( value );

      if ( cleanTiming.end < cleanTiming.begin ) throw [ {
        code: 'timings.invalid',
        message: 'end cannot happen earlier than begin',
        field: 'timings'
      } ]

      carry.clean.push( value );

    } catch ( e ) {

      carry.errors = carry.errors.concat( e.map( e => _.extend( e, { index } ) ) );

    }

    return carry;

  }, { errors: [], clean: [] } );

  if ( errors.length ) throw errors;

  return clean;

}
