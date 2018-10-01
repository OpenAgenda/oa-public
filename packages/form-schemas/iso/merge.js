"use strict";

const _ = require( 'lodash' );
const ih = require( 'immutability-helper' );

module.exports = mergeAll;

function mergeAll( ...args ) {

  if ( args.length === 1 ) return _.first( args );

  return args.slice( 1 ).reduce( merge, args[ 0 ] );

}

function merge( s1, s2 ) {

  const s2Fields = s2.fields.map( f => f.field );

  const merged = _.assign( {}, s1, { fields: s1.fields.filter( f => !s2Fields.includes( f.field ) ) } );

  s2.fields.forEach( field => {

    const index = _.findIndex( s1.fields, f => f.field === field.field );

    if ( index === -1 ) {

      merged.fields.push( field );

    } else {

      merged.fields.push( _mergeField( s1.fields[ index ], field ) );

    }

  } );

  return merged;

}

function _mergeField( field, mergeWithField ) {

  if ( !mergeWithField ) return field;

  const update = [ 'label', 'info', 'placeholder', 'sub' ]
    .filter( f => mergeWithField[ f ] )
    .reduce( ( c, f ) => _.set( c, f, { $set: mergeWithField[ f ] } ), {} );

  if ( !_.keys( update ).length ) return field;

  return ih( field, update );

}
