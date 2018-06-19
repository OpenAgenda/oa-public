"use strict";

const _ = require( 'lodash' );

const FormSchema = require( '../../iso/FormSchema' );
const validate = require( '../../iso/FormSchema' ).validate;

module.exports = ( formSchema, customFields ) => {

  let fs = new FormSchema( formSchema );

  customFields.forEach( f => {

    let parse = ( {
      text: parseBasic,
      integer: parseBasic,
      number: parseBasic,
      textarea: parseBasic,
      wysiwyg: parseBasic,
      url: parseBasic,
      email: parseBasic,
      image: parseBasic,
      file: parseBasic,
      multichoice: parseChoice,
      select: parseChoice,
      radio: parseChoice,
      checkbox: parseCheckbox
    } )[ f.fieldType ];

    if ( !parse ) return;

    fs.addField( _.extend( parse( f ), {
      origin: 'custom'
    } ) );

  } );

  return validate( fs.getData() );

}

function parseBasic( field ) {

  let csField = _parseBase( field, true );

  return csField;

}

function parseChoice( field ) {

  let minMaxed = ![ 'radio', 'select' ].includes( field.fieldType );

  let csField = _parseBase( field, minMaxed );

  return _.extend( csField, { options: field.options } );

}

function parseCheckbox( field ) {

  let csField = _parseBase( field, false );

  return _.extend( csField, {
    options: [ {
      label: field.label,
      value: true
    } ]
  } );
}

/**
 * extract base field configuration
 */
function _parseBase( field, minMaxed = false ) {

  let base = {
    field: field.name,
    optional: field.optional !== undefined ? !!field.optional : true,
    label: field.label,
    fieldType: _fieldType( field.fieldType ),
    read: field.type === 'private' ? 'moderator' : null,
    write: 'contributor'
  }

  if ( minMaxed && field.min ) {

    base.min = field.min;

  }

  if ( minMaxed && field.max ) {

    base.max = field.max;

  }

  if ( field.info ) {

    base.info = field.info;

  }

  return base;

}

function _fieldType( legacy ) {

  if ( legacy === 'multichoice' ) return 'checkbox';

  if ( legacy === 'select' ) return 'radio';

  return legacy;

}