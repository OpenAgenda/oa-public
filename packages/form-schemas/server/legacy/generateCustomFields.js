"use strict";

const _ = require( 'lodash' );

const schemaToCustom = {
  integer: 'integer',
  number: 'number',
  text: 'text',
  textarea: 'textarea',
  markdown: 'textarea',
  slate: 'textarea',
  html: 'textarea',
  image: 'text',
  file: 'text',
  url: 'url',
  email: 'email'
}

module.exports = schema => {

  const messages = [];

  const customFields = schema.fields
    .filter( f => _.keys( schemaToCustom ).includes( f.fieldType ) )
    .map( f => {

      if ( !f.origin ) {

        messages.push( `${f.field}: field origin is not set` );

      }

      const custom = {
        name: f.field,
        type: 'public',
        fieldType: schemaToCustom[ f.fieldType ],
        optional: !!f.optional,
        label: _multilingualLabel( f.label )
      };

      [ 'min', 'max' ]
        .filter( attr => ![ undefined, null ].includes( f[ attr ] ) )
        .forEach( attr => { custom[ attr ] = f[ attr ] } );

      return custom;

    } );

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
