"use strict";

const _ = require( 'lodash' );
const ih = require( 'immutability-helper' );

module.exports = mergeAll;

function mergeAll( ...args ) {

  if ( args.length === 1 ) return _.first( args );

  return args.slice( 1 ).reduce( merge, args[ 0 ] );

}

function merge( mergedIn, mergeWith ) {

  if ( !_.get( mergeWith, 'fields' ) ) return mergedIn;

  if ( !_.get( mergedIn, 'fields' ) ) return mergeWith;

  return _.assign( {}, mergedIn, { 
    fields: mergeWith.fields.concat( mergedIn.fields ).reduce( ( fields, field ) => {

      const index = fields.map( f => f.field ).indexOf( field.field );

      if ( index === -1 ) {

        fields.push( field );

      } else {

        fields[ index ] = _mergeField( field, fields[ index ] );

      }

      return fields;

    }, [] )
  } );

}

function _mergeField( field, mergeWithField ) {

  if ( !mergeWithField ) return field;

  const protectedKeys = [ 'field', 'fieldType' ];

  const update = _.keys( mergeWithField )
    .filter( k => !protectedKeys.includes( k ) )
    .filter( f => mergeWithField[ f ] )
    .reduce( ( c, f ) => _.set( c, f, { $set: mergeWithField[ f ] } ), {} );

  if ( field.optional && mergeWithField.optional === false ) {

    update.optional = { $set: false }

  }

  if ( !_.keys( update ).length ) return field;

  return ih( field, update );

}
