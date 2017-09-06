"use strict";

const config = require( '../config' );

const schema = require( 'validators/schema' );

schema.register( {
  choice: require( 'validators/choice' ),
  text: require( 'validators/text' )
} );

const validate = schema( {
  field: {
    type: 'text',
    default: 'timings'
  },
  interval: {
    type: 'choice',
    unique: true,
    options: [ 'hour', 'day', 'week', 'month', 'year' ],
    default: 'day'
  },
  format: {
    type: 'choice',
    unique: true,
    options: [ 'YYYY-MM-dd', 'YYYY-MM', 'YYYY', 'YYYY-MM-dd HH:mm' ],
    default: 'YYYY-MM-dd'
  }
} );

module.exports = values => {

  const clean = validate( values );

  // config is not available at require, needs to be included at eval
  clean.includes = JSON.stringify( config.baseSearchIncludes );

  return clean;

}