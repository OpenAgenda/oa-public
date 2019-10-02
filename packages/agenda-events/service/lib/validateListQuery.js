"use strict";

const schema = require( '@openagenda/validators/schema' );
const states = require( '../../iso/states' );
const _ = require( 'lodash' );

schema.register( {
  choice: require( '@openagenda/validators/choice' ),
  integer: require( '@openagenda/validators/integer' )
} );

const validate = schema( {
  state: {
    type: 'choice',
    optional: true,
    unique: true,
    options: _.keys( states ).map( k => k.toLowerCase() ).concat( _.values( states ) )
  },
  eventUid: {
    type: 'integer',
    optional: true,
    list: {
      default: null
    }
  },
  aggregated: {
    type: 'boolean',
    optional: true,
    default: null
  }
} );

module.exports = values => {

  const clean = validate( values );

  if ( clean.state && typeof clean.state === 'string' ) {

    clean.state = states[ Object.keys( states ).filter( k => clean.state === k.toLowerCase() )[ 0 ] ];

  } else if ( clean.state === null ) {

    return _.omit( clean, [ 'state' ] );

  }

  return clean;

}
