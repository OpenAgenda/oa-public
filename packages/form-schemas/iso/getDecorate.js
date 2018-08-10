"use strict";

/**
 * returns function that decorates valid data for a form-schema with full option values and labels
 */

const update = require( 'immutability-helper' );

const _ = {
  isArray: require( 'lodash/isArray' ),
  omit: require( 'lodash/omit' )
}

module.exports = fields => {

  return decorate.bind( null, fields );

}

module.exports.decorate = decorate;

function decorate( fields, data ) {

  const changes = {};

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

  return update( data, changes );

}


function _decorate( options, id ) {

  const option = options.find( o => o.id === id );

  return typeof option === 'undefined' || option === null ? null : _.omit( option, [ 'legacyId' ] );

}
