"use strict";

const boolean = require( '@openagenda/validators/boolean' );

const schema = require( '@openagenda/validators/schema' );

schema.register( { boolean } );

module.exports = () => schema( {
  hi: { type: 'boolean', default: false },
  ii: { type: 'boolean', default: false },
  vi: { type: 'boolean', default: false },
  mi: { type: 'boolean', default: false },
  pi: { type: 'boolean', default: false }
} );
