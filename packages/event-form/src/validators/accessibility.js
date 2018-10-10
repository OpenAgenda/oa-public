"use strict";

const boolean = require( '@openagenda/validators/boolean' );

const schema = require( '@openagenda/validators/schema' );

schema.register( { boolean } );

module.exports = () => schema( {
  hi: { type: 'boolean', defaultValue: false },
  sl: { type: 'boolean', defaultValue: false },
  vi: { type: 'boolean', defaultValue: false },
  mi: { type: 'boolean', defaultValue: false },
  pi: { type: 'boolean', defaultValue: false }
} );
