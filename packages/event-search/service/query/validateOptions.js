"use strict";

const schema = require( '@openagenda/validators/schema' );

schema.register( {
  text: require( '@openagenda/validators/text' ),
  boolean: require( '@openagenda/validators/boolean' ),
  pass: require( '@openagenda/validators/pass' ),
  choice: require( '@openagenda/validators/choice' )
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
  },
  geojson: {
    type: 'boolean',
    default: false
  },
  monolingual: {
    type: 'text',
    default: null,
    list: {
      max: 2
    }
  }
} );