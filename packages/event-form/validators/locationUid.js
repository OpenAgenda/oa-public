"use strict";

const _ = {
  assign: require( 'lodash/assign' )
};

const integer = require( '@openagenda/validators/integer' );

module.exports = options => integer( _.assign( {
  field: 'locationUid',
  optional: false,
  max: 99999999,
  min: 1
}, options ) );
