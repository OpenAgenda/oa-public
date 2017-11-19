"use strict";

const FormSchema = require( '../iso/FormSchema' ),

  validate = require( '../iso/FormSchema' ).validate,

  slug = require( 'slug' ),

  _ = require( 'lodash' );

module.exports = ( formSchema, tagSet, type = 'tag' ) => {

  let fs = new FormSchema( formSchema );

  tagSet.groups.forEach( ( g, i ) => {

    fs.addField( _parseGroup( g, i, type ) );

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
  } ] }, 'category' );

}


function _parseGroup( g, i, type = 'tag' ) {

  const field = g.name ? slug( g.name, { lower: true } ) : type + '-group' + ( i ? '-' + i : '' );

  return _.extend( {
    field,
    optional: !g.required,
    origin: type === 'tag' ? 'tags' : 'categories',
    label: {
      fr: g.name || 'Tags'
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
      value: t.slug,
      legacyId: t.id
    } ) )
  }, g.unique ? {} : {
    min: null,
    max: null
  } );

}