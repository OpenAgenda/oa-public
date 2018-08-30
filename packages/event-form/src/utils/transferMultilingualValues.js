"use strict";

const _ = require( 'lodash' );
const ih = require( 'immutability-helper' );

module.exports = ( values, multilingualFields, fromLanguage, toLanguage ) => {

  const update = multilingualFields.reduce( ( update, field ) => _.set( update, field, {
    $set: _.set( {}, toLanguage, _.get( values, [ field, fromLanguage ] ) )
  } ), {} );

  return ih( values, update );

}
