"use strict";

const schema = require( '@openagenda/validators/schema' );

schema.register( {
  integer: require( '@openagenda/validators/integer' )
} );

const validate = schema( {
  identifier: {
    type: 'integer',
    list: { default: null }
  }
} );

module.exports = function listQuery(dirty) {
  const clean = validate(dirty);

  clean.identifier = clean.identifier?.filter(id => ![undefined, null].includes(id)) ?? null;

  return clean;
}
