"use strict";

const _ = require( 'lodash' );
const ih = require( 'immutability-helper' );

module.exports = ( values, multilingualFields, languagesToRemove ) => {

  const update = multilingualFields.reduce( ( update, field ) => values[ field ] ? _.set( update, field, {
    $unset: languagesToRemove
  } ) : update, {} );

  return ih( values, update );

}
