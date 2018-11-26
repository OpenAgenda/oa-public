"use strict";

const _ = require( 'lodash' );

const schema = require( '@openagenda/validators/schema' );

schema.register( {
  text: require( '@openagenda/validators/text' ),
  integer: require( '@openagenda/validators/integer' ),
  latitude: require( '@openagenda/validators/latitude' ),
  longitude: require( '@openagenda/validators/longitude' )  
} );

const validate = schema( {
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
  }
} );

module.exports = options => value => {

  if ( _.get( options, 'optional' ) && !value ) {

    return _.get( options, 'default' );

  }

  try {

    return validate( value );

  } catch ( errors ) {

    throw errors.map( e => _.assign( e, {
      field: 'location',
      code: 'location.' + e.code
    } ) );

  }

}
