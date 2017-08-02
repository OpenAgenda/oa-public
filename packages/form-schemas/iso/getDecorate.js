"use strict";

/**
 * returns function that decorates valid data for a form-schema with full option values and labels
 */

const ih = require( 'immutability-helper' );

const _ = {
  isArray: require( 'lodash/isArray' ),
  omit: require( 'lodash/omit' )
}

module.exports = fields => {

  return decorate.bind( null, fields );

}

module.exports.decorate = decorate;

function decorate( fields, data ) {

  let changes = {};

  fields.forEach( f => {

    if ( !f.options ) return;

    if ( data[ f.field ] === undefined ) return;

    if ( _.isArray( data[ f.field ] ) ) {

      changes[ f.field ] = {
        $set: data[ f.field ].map( _decorate.bind( null, f.options ) )
      }

    } else {

      changes[ f.field ] = {
        $set: _decorate( f.options, data[ f.field ] )
      }

    }

  } );

  return ih( data, changes );

}


function _decorate( options, id ) {

  let matches = options.filter( o => o.id );

  if ( !matches.length ) return null;

  return _.omit( matches[ 0 ], [ 'legacyId' ] );

}