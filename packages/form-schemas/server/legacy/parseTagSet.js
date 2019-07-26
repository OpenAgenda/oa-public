"use strict";

const _ = require( 'lodash' );
const slug = require( 'slug' );

const log = require( '@openagenda/logs' )( 'parseTagSet' );

const FormSchema = require( '../../iso/FormSchema' );
const validate = require( '../../iso/FormSchema' ).validate;

module.exports = ( formSchema, tagSet, type = 'tag' ) => {

  let fs = new FormSchema( formSchema );

  tagSet.groups.forEach( ( g, i ) => {

    try {

      fs.addField( _parseGroup( g, i, type ) );

    } catch ( e ) {

      log( 'error', 'could not parse %s group', type, e );

    }

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

  const field = g.name ? slug( g.name, { lower: true } ) : type + '-group' + ( i ? '-' + i : '' );

  return _.extend( {
    field,
    optional: !g.required,
    default: null,
    origin: type === 'tag' ? 'tags' : 'categories',
    label: {
      fr: g.name || 'Tags'
    },
    info: g.info ? {
      fr: g.info
    } : null,
    read: null,
    write: null,
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
