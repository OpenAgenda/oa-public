"use strict";

var validators = require( 'validators' ),

utils = require( 'utils' );

/**
 * stakeholder validator. Needs the fields settings to work
 */

module.exports = function( fields ) {

  return validators.set( fields.map( function( f ) {

    return validators[ f.type ]( utils.extend( { field: f.field }, f.params ) );

  } ) );

}