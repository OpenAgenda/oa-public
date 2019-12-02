"use strict";

const _ = require('lodash');
const ih = require('immutability-helper');

module.exports = mergeAll;

function mergeAll(...args) {
  const options = {
    access: null
  };

  if (args.length === 1) return _.first(args);

  if (_.last(args) && _.last(args).access !== undefined) {
    Object.assign(options, args.pop());
  }

  const merged = args.slice(1).reduce(
    reduceFields,
    _assignSchemaIdToNonAbstractFields(args[0])
  );

  if (!options.access) return merged;

  const accessType = Object.keys(options.access)[0];
  const access = options.access[accessType];

  return {
    ...merged,
    fields: merged.fields.filter(f => !f[accessType] || f[accessType].includes(access))
  }
}

function reduceFields(mergedIn, mergeWith) {

  if ( !_.get( mergeWith, 'fields' ) ) return mergedIn;

  if ( !_.get( mergedIn, 'fields' ) ) return mergeWith;

  return _.assign( {}, mergedIn, {
    fields: _assignSchemaIdToNonAbstractFields( mergeWith ).fields.concat( mergedIn.fields ).reduce( ( fields, field ) => {

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

  const protectedKeys = [ 'field', 'fieldType', 'origin' ];

  const update = _.keys( mergeWithField )
    .filter( k => !protectedKeys.includes( k ) )
    .filter( f => mergeWithField[ f ] !== undefined  )
    .reduce( ( c, f ) => _.set( c, f, { $set: mergeWithField[ f ] } ), {} );

  if ( field.optional && mergeWithField.optional === false ) {

    update.optional = { $set: false }

  }

  if ( _.get( mergeWithField, 'allowedOptions' ) ) {

    update.options = {
      $set: _.get( field, 'options' ).filter( o => mergeWithField.allowedOptions.includes( o.id ) )
    };

    update[ '$unset' ] = [ 'allowedOptions' ];

  }

  if ( field.schemaId ) {

    update[ 'schemaId' ] = { $set: field.schemaId };

  }

  if ( !_.keys( update ).length ) return field;

  return ih( field, update );

}

function _assignSchemaIdToNonAbstractFields( schema ) {

  return {
    custom: _.get( schema, 'custom', {} ),
    fields: _.get( schema, 'fields', [] ).map( f => _.assign( {}, f, {
      schemaId: _isAbstract( f ) ? null : _.get( schema, 'id', null )
    } ) )
  }

}

function _isAbstract( field ) {

  return _.get( field, 'fieldType', 'abstract' ) === 'abstract'

}
