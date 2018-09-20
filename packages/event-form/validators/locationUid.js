"use strict";

module.exports = () => require( '@openagenda/validators/integer' )( {
  field: 'locationUid',
  optional: false,
  max: 99999999,
  min: 1
} );
