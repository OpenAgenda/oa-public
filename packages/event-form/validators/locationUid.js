"use strict";

const integer = require( '@openagenda/validators/integer' );

module.exports = () => integer( {
  field: 'locationUid',
  max: 99999999,
  min: 1
} );