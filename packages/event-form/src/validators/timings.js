"use strict";

const list = require( '@openagenda/validators/list' );
const schema = require( '@openagenda/validators/schema' );

schema.register( {
  date: require( '@openagenda/validators/date' )
} );

const validateTiming = schema( {
  begin: {
    type: 'date',
    optional: false
  },
  end: {
    type: 'date',
    optional: false
  }
} );

module.exports = () => list( {
  field: 'timings',
  min: 1,
  types: [ 'timing' ],
  validators: { timing: validateTiming } 
} );