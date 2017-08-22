"use strict";

const schema = require( 'validators/schema' );

schema.register( {
  text: require( 'validators/text' ),
  boolean: require( 'validators/boolean' ),
  pass: require( 'validators/pass' ),
  choice: require( 'validators/choice' )
} );


module.exports = schema( {
  detailed: {
    type: 'boolean',
    default: false
  },
  extensions: {
    type: 'text',
    list: true
  },
  merge: { // merge some fields. Example: customAdministrator and customContributor into custom
    type: 'pass',
    default: null
  },
  aggregations: {
    list: { default: null },
    type: 'pass' // aggregations are cleaned separately - see aggregation/index
  }
} );