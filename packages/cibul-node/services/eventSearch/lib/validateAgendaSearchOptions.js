'use strict';

const schema = require('@openagenda/validators/schema');

schema.register({
  boolean: require( '@openagenda/validators/boolean' ),
  pass: require( '@openagenda/validators/pass' ),
  text: require( '@openagenda/validators/text' )
});

module.exports = schema({
  detailed: {
    type: 'boolean',
    default: false
  },
  aggregations: {
    type: 'pass',
    default: null
  },
  monolingual: {
    type: 'text',
    list: { max: 2 }
  }
})
