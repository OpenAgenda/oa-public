"use strict";

const schema = require( '@openagenda/validators/schema' );

schema.register( {
  choice: require( '@openagenda/validators/choice' ),
  text: require( '@openagenda/validators/text' )
} );

module.exports = schema( {
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
