"use strict";

const FormSchema = require( '../iso/FormSchema' ),

  validate = require( '../iso/FormSchema' ).validate,

  _ = require( 'lodash' );

module.exports = ( formSchema, customFields ) => {

  let fs = new FormSchema( formSchema );

  customFields.forEach( f => {

    let parse = ( {
      text: parseBasic,
      integer: parseBasic,
      number: parseBasic,
      textarea: parseBasic,
      // url,
      // email,
      // image,
      // multichoice,
      // select,
      radio: parseChoice,
      // checkbox
    } )[ f.fieldType ];

    if ( !parse ) return;

    fs.addField( parse( f ) );

  } );

  return validate( fs.getData() );

}

function parseBasic( field ) {

  let csField = _parseBase( field, true );

  return csField;

}

function parseChoice( field ) {

  let minMaxed = field.fieldType === 'radio' ? false : true;

  let csField = _parseBase( field, minMaxed );

  return _.extend( csField, { options: field.options } );

}

/**
 * extract base field configuration
 */
function _parseBase( field, minMaxed = false ) {

  let base = {
    field: field.name,
    optional: field.optional !== undefined ? !!field.optional : true,
    label: field.label,
    fieldType: field.fieldType,
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