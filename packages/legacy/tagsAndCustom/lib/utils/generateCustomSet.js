"use strict";

const _ = require( 'lodash' );

const log = require('@openagenda/logs')('generateCustomSet');

const schemaToCustom = {
  integer: 'integer',
  number: 'number',
  text: 'text',
  textarea: 'textarea',
  markdown: 'textarea',
  slate: 'textarea',
  html: 'textarea',
  image: 'image',
  file: 'file',
  url: 'url',
  email: 'email',
  checkbox: 'checkbox',
  radio: 'radio'
}

module.exports = ( schema, customOriginOnly = false ) => {
  const messages = [];
  log('processing', JSON.stringify( schema, null, 2));

  const customFields = schema.fields
    .filter( f => _.keys( schemaToCustom ).includes( f.fieldType ) )
    .filter( f => customOriginOnly ? f.origin === 'custom' : true )
    .map( f => {

      if ( !f.origin ) {
        messages.push( `${f.field}: field origin is not set` );
      }

      const custom = {
        name: f.field,
        type: _legacyAccessType( f ),
        fieldType: schemaToCustom[ f.fieldType ],
        optional: !!f.optional,
        label: _multilingualLabel( f.label )
      };

      [ 'min', 'max' ]
        .filter( attr => ![ undefined, null ].includes( f[ attr ] ) )
        .forEach( attr => { custom[ attr ] = f[ attr ] } );

      return custom;

    } );

  log('extracted', customFields);

  return {
    customFields,
    messages
  }
}

function _multilingualLabel( label ) {
  return _.isString( label ) ? {
    fr: label,
    en: label
  } : label;
}

function _legacyAccessType( field ) {
  if ( !field.read ) return 'public';

  if ( field.read.includes( 'contributor' ) ) {
    return 'private';
  }

  if ( field.read.includes( 'administrator' ) ) {
    return 'administrator';
  }

  return 'private';
}
