"use strict";

const _ = require( 'lodash' );

const roleValues = require( './roleValues' );

module.exports = value => {

  const code = _.first( roleValues.filter( v => (
    value === v.key
  ) || (
    v.slugs.includes( value )
  ) ).map( v => v.code ) );

  if ( code === undefined ) {
    throw new Error( 'Unknown role' );
  }

  return code;

}
