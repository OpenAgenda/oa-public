"use strict";

const schema = require( 'validators/schema' );
const omit = require( 'lodash/omit' );
const extend = require( 'lodash/extend' );

schema.register( {
  text: require( 'validators/text' ),
  phone: require( 'validators/phone' ),
  email: require( 'validators/email' )
} );

var validators = require( 'validators' ),

utils = require( 'utils' );

/**
 * stakeholder validator. Needs the fields settings to work
 */

module.exports = fields => {

  let s = {};

  fields.forEach( f => {

    s[ f.field ] = extend( omit( f, [ 'params', 'field' ] ), f.params, { optional: false } );

  } );

  return schema( s );

  // derive a schema from fields ( if possible )
  // validators.set is deprecated.
  // should definitively use schema

  /*return validators.set( fields.map( function( f ) {

    return validators[ f.type ]( utils.extend( { field: f.field }, f.params ) );

  } ) );*/

}