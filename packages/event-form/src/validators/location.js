"use strict";

const _ = require( 'lodash' );

const schema = require( '@openagenda/validators/schema' );

schema.register( {
  text: require( '@openagenda/validators/text' ),
  integer: require( '@openagenda/validators/integer' ),
  latitude: require( '@openagenda/validators/latitude' ),
  longitude: require( '@openagenda/validators/longitude' )
} );

const locationSchema = {
  uid: {
    type: 'integer',
    optional: false
  },
  name: {
    type: 'text'
  },
  address: {
    type: 'text'
  },
  latitude: {
    type: 'latitude'
  },
  longitude: {
    type: 'longitude'
  },
  timezone: {
    type: 'text'
  }
};

const validate = schema(locationSchema);
const validateDraft = schema({ ...locationSchema, uid: {
  type: 'integer'
} });

module.exports = options => value => {

  const optional = _.get( options, 'optional' );

  if ( optional && !value ) {

    return _.get( options, 'default' );

  }

  try {

    return ( optional ? validateDraft : validate )( value );

  } catch ( errors ) {

    throw errors.map( e => _.assign( e, {
      field: 'location',
      code: 'location.' + e.code
    } ) );

  }

}
