"use strict";

/**
 * returns function that decorates valid data for a form-schema with full option values and labels
 */

const update = require( 'immutability-helper' );

const _ = {
  assign: require( 'lodash/assign' ),
  get: require( 'lodash/get' ),
  isArray: require( 'lodash/isArray' ),
  isObject: require( 'lodash/isObject' ),
  mapKeys: require( 'lodash/mapKeys' ),
  omit: require( 'lodash/omit' ),
  find: require( 'lodash/find' )
}

const flattenLabels = require( '../lib/flatten' );

module.exports = fields => {

  return decorate.bind( null, fields );

}

module.exports.decorate = decorate;

function decorate( fields, data, options = {} ) {

  const {
    lang,
    labelsAsKeys,
    labelsAsValues,
    ignoreNonArrayObjects
  } = _.assign( {
    lang: null,
    labelsAsKeys: false,
    labelsAsValues: false,
    ignoreNonArrayObjects: false
  }, options )

  const changes = {};

  const cleanFields = fields.map( f => lang || labelsAsKeys ? flattenLabels( f, lang ) : f );

  cleanFields.forEach( f => {

    if ( !f.options ) return;

    if ( data[ f.field ] === undefined ) return;

    if ( _.isArray( data[ f.field ] ) ) {

      changes[ f.field ] = {
        $set: data[ f.field ].map( _decorateOption.bind( null, labelsAsValues, f.options ) )
      }

    } else {

      changes[ f.field ] = {
        $set: _decorateOption( labelsAsValues, f.options, data[ f.field ] )
      }

    }

  } );

  let updatedValues = update( data, changes );

  if ( ignoreNonArrayObjects ) {

    updatedValues = _.omit( updatedValues, cleanFields.filter( f => (
      ( !_.isArray( updatedValues[ f.field ] ) ) && _.isObject( updatedValues[ f.field ] )
    ) ).map( f => f.field ) );

  }

  if ( !labelsAsKeys ) return updatedValues;

  return _.omit( _.mapKeys( updatedValues,
    ( v, k ) => _.get( _.find( cleanFields, { field: k } ), 'label', '$remove' )
  ), [ '$remove' ] );

}


function _decorateOption( labelsAsValues, options, id ) {

  const option = options.find( o => o.id === id );

  const decoratedOption = typeof option === 'undefined' || option === null ? null : _.omit( option, [ 'legacyId' ] );

  if ( labelsAsValues && _.get( decoratedOption, 'label' ) ) return decoratedOption.label;

  return decoratedOption;

}
