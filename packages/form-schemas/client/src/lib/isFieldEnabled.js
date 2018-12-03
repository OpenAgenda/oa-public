"use strict";

const _ = require( 'lodash' );

module.exports = ( field, values, disabledForm = false ) => {

  if ( disabledForm ) return false;

  if ( !field.enableWith ) return true;

  return !!_.get( values, field.enableWith );

}
