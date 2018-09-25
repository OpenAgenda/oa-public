"use strict";

const schema = require( '@openagenda/validators/schema' );

const _ = {
  isArray: require( 'lodash/isArray' ),
  assign: require( 'lodash/assign' )
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


module.exports = ( options = {} ) => value => {

  const params = _.assign( {
    optional: false
  }, options || {} );

  if ( ( !_.isArray( value ) || !value.length ) && !params.optional ) {

    throw [ {
      code: 'timings.empty',
      message: 'At least one timing is required',
      field: 'timings'
    } ];

  } else if ( !_.isArray( value ) || !value.length ) {

    return [];

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

      carry.errors = carry.errors.concat( e.map( e => _.assign( e, { index } ) ) );

    }

    return carry;

  }, { errors: [], clean: [] } );

  if ( errors.length ) throw errors;

  return clean;

}
