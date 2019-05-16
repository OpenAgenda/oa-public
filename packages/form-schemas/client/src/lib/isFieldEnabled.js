"use strict";

const _ = require( 'lodash' );

module.exports = ( field, values, disabledForm = false ) => {

  if ( disabledForm ) return false;

  if ( !field.enableWith ) return true;

  const enableWithValue = _.get( values, field.enableWith );

  return !!( _.isArray( enableWithValue ) ? enableWithValue.length : enableWithValue );

}
