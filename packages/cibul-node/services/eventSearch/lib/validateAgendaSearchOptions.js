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
  private: {
    type: 'boolean',
    default: false
  },
  includeCustom: {
    type: 'boolean',
    default: false
  },
  // if agenda data was loaded prior to search call, it can be reused here
  agenda: {
    type: 'pass',
    default: null
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
