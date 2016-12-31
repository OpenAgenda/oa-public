"use strict";

const schema = require( 'validators/schema' );
const omit = require( 'lodash/omit' );
const extend = require( 'lodash/extend' );

schema.register( {
  text: require( 'validators/text' ),
  phone: require( 'validators/phone' ),
  email: require( 'validators/email' )
} );

/**
 * stakeholder validator. Needs the fields settings to work
 */

module.exports = fields => schema( module.exports.convertFieldsToSchemaMap( fields ) );

module.exports.convertFieldsToSchemaMap = fields => {

  let s = {};

  fields.forEach( f => {

    s[ f.field ] = extend( omit( f, [ 'params', 'field' ] ), f.params, { optional: false } );

  } );

  return s;

}