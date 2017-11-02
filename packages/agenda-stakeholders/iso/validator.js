"use strict";

const schema = require( '@openagenda/validators/schema' );
const omit = require( 'lodash/omit' );
const extend = require( 'lodash/extend' );

schema.register( {
  text: require( '@openagenda/validators/text' ),
  phone: require( '@openagenda/validators/phone' ),
  email: require( '@openagenda/validators/email' )
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