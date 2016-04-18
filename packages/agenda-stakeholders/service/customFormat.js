"use strict";

const utils = require( 'utils' ),

slug = require( 'slug' );

/**
 * format custom values from and to fields
 * tested in file of same name
 */

module.exports = {
  getFieldValues: getFieldValues,
  getValues: getValues,
  test: {
    _areFieldValues: _areFieldValues
  }
};


function getFieldValues( data, settings ) {

  let values = getValues( data, settings ),

  fieldValues = {};

  Object.keys( values ).forEach( k => {

    fieldValues[ utils.toUnderscore( k ) ] = typeof values[ k ] === 'object' ? values[ k ].label : values[ k ];

  } );

  return fieldValues;

}


function getValues( data, settings ) {

  if ( !_areFieldValues( data, settings ) ) return data;

  let values = {};

  Object.keys( data ).forEach( k => {

    let fieldSettings = settings.fields.filter( f => f.field === k );

    if ( !fieldSettings.length ) return;

    if ( fieldSettings[ 0 ].slugged ) {

      values[ k ] = {
        label: data[ k ],
        slug: slug( data[ k ], { lower: true } )
      }

    } else {

      values[ k ] = data[ k ];

    }

  } );

  return utils.toCamelCase( values );

}


function _areFieldValues( data, settings ) {

  // if there are slugs, then data are values
  let fieldSettings = settings.fields.filter( f => f.slugged );

  if ( fieldSettings.length 

  && typeof data[ fieldSettings[ 0 ].field ] === 'object' ) {

    return false;

  }

  // if there are underscored keys then data is field values
  return !!Object.keys( data ).filter( k => k.indexOf( '_' ) !== -1 ).length;

}