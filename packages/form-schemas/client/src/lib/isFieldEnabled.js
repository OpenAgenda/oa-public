"use strict";

const _ = require( 'lodash' );

module.exports = ( field, values ) => {

  if ( !field.enableWith ) return true;

  return !!_.get( values, field.enableWith );

}
