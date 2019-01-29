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

  return schema.fields
    .filter( f => _.keys( schemaToCustom ).includes( f.fieldType ) )
    .map( f => {

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

}

function _multilingualLabel( label ) {

  return _.isString( label ) ? {
    fr: label,
    en: label
  } : label;

}
