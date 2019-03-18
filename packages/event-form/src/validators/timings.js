"use strict";

const schema = require( '@openagenda/validators/schema' );

const _ = {
  isArray: require( 'lodash/isArray' ),
  assign: require( 'lodash/assign' )
}

schema.register( {
  date: require( '@openagenda/validators/date' ),
  regex: require( '@openagenda/validators/regex' ),
  integer: require( '@openagenda/validators/integer' )
} );

const validateTiming = schema( {
  begin: {
    date: {
      type: 'regex',
      regex: /^[0-9][0-9][0-9][0-9]\-[0-9][0-9]\-[0-3][0-9]$/,
      optional: false
    },
    hours: {
      type: 'integer',
      min: 0,
      max: 23,
      optional: false
    },
    minutes: {
      type: 'integer',
      min: 0,
      max: 59,
      optional: false
    }
  },
  end: {
    date: {
      type: 'regex',
      regex: /^[0-9][0-9][0-9][0-9]\-[0-9][0-9]\-[0-3][0-9]$/,
      optional: false
    },
    hours: {
      type: 'integer',
      min: 0,
      max: 23,
      optional: false
    },
    minutes: {
      type: 'integer',
      min: 0,
      max: 59,
      optional: false
    }
  }
} );


module.exports = ( options = {} ) => value => {

  const params = _.assign( {
    optional: false,
    default: null
  }, options || {} );

  const isEmpty = !_.isArray( value ) || !value.length;

  const isTooLong = _.isArray( value ) && value.length > 800;

  if ( isEmpty && params.default ) {

    return params.default;

  } else if ( isEmpty && !params.optional ) {

    throw [ {
      code: 'timings.empty',
      message: 'At least one timing is required',
      field: 'timings'
    } ];

  } else if ( isEmpty ) {

    return [];

  } else if ( isTooLong ) {

    throw [ {
      code: 'timings.toolong',
      message: 'There cannot be more than 800 timings',
      field: 'timings'
    } ]

  }

  const { errors, clean } = value.reduce( ( carry, value, index ) => {

    try {

      const cleanTiming = validateTiming( value );

      carry.clean.push( value );

    } catch ( e ) {

      carry.errors = carry.errors.concat( e.map( e => _.assign( e, { index } ) ) );

    }

    return carry;

  }, { errors: [], clean: [] } );

  if ( errors.length ) throw errors;

  return clean;

}
