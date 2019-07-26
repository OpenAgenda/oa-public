"use strict";

const _ = require( 'lodash' );

const FormSchema = require( '../../iso/FormSchema' );
const validate = require( '../../iso/FormSchema' ).validate;

module.exports = ( formSchema, customFields ) => {

  let fs = new FormSchema( formSchema );

  customFields.forEach( f => {

    const parse = ( {
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

    const parsed = _.extend( parse( f ), {
      origin: 'custom',
      default: null
    } );

    fs.addField( parsed );

  } );

  return validate( fs.getData() );

}

function parseBasic( field ) {

  return _parseBase( field, true );

}

function parseChoice( field ) {

  const minMaxed = ![ 'radio', 'select' ].includes( field.fieldType );

  const csField = _parseBase( field, minMaxed );

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

  const base = {
    field: field.name,
    optional: field.optional !== undefined ? !!field.optional : true,
    label: field.label,
    fieldType: _fieldType( field.fieldType ),
    write: null,
    read: null
  }

  if ( field.type === 'private' ) {

    base.read = [ 'contributor', 'moderator', 'administrator' ];

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
