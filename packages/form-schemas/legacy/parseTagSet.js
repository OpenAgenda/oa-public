"use strict";

const FormSchema = require( '../iso/FormSchema' ),

  validate = require( '../iso/FormSchema' ).validate,

  slug = require( 'slug' ),

  _ = require( 'lodash' );

module.exports = ( formSchema, tagSet ) => {

  let fs = new FormSchema( formSchema );

  tagSet.groups.forEach( g => {

    fs.addField( _parseGroup( g ) );

  } );

  return validate( fs.getData() );

}

module.exports.categories = ( formSchema, c ) => {

  return module.exports( formSchema, { groups: [ { 
    name: c.name, 
    info: c.info, 
    unique: true,
    required: c.required,
    tags: c.categories
  } ] } );

}


function _parseGroup( g ) {

  return _.extend( {
    field: slug( g.name, { lower: true } ),
    optional: !g.required,
    label: {
      fr: g.name
    },
    info: g.info ? {
      fr: g.info
    } : null,
    read: null,
    write: 'contributor',
    fieldType: g.unique ? 'radio' : 'checkbox',
    options: g.tags.map( t => ( {
      label: {
        fr: t.label
      },
      value: t.slug
    } ) )
  }, g.unique ? {} : {
    min: null,
    max: null
  } );

}