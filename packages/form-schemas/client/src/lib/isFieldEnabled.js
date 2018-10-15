"use strict";

module.exports = ( field, values ) => {

  if ( !field.enableWith ) return true;

  return !!_.get( values, field.enableWith );

}
