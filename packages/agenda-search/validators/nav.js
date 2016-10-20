"use strict";

const schemas = require( 'validators/schema' ),

defaults = {
  page: null,
  offset: 0,
  limit: 20
};

schemas.register( {
  number: require( 'validators/number' )
} );

const schema = schemas( {
  page: {
    type: 'number',
    optional: true,
    default: defaults.page,
    min: 1
  },
  offset: {
    type: 'number',
    optional: true,
    default: defaults.offset
  },
  limit: {
    type: 'number',
    optional: true,
    default: defaults.limit,
    max: 100
  }
} );

module.exports = function( navQuery ) {

  let clean = {
    page: defaults.page,
    offset: defaults.offset,
    limit: defaults.limit 
  };

  try {

    clean = schema( navQuery );

  } catch( e ) {

    console.error( 'got nav errors: %s', e );

  }

  if ( clean.page !== null ) {

    clean.offset = ( clean.page - 1 ) * clean.limit;

  } else {

    clean.page = Math.ceil( clean.offset / clean.limit + 1 );

  }

  return {
    offset: clean.offset,
    limit: clean.limit,
    page: clean.page
  }

}