"use strict";

const _ = require( 'lodash' );

const includeTypes = [ 'radio', 'select', 'checkbox' ];

const uniques = [ 'radio', 'select' ];

module.exports = schema => {

  const tagSettableFields = schema.fields
    .filter( f => includeTypes.includes( f.fieldType ) );

  const messages = tagSettableFields
    .filter( f => !!f.origin )
    .map( f => `${f.field}: field origin is not set` );

  if ( !tagSettableFields.length ) return null;

  const tagSet = {
    groups: tagSettableFields.map( f => ( {
      name: _monoLabel( f.label ),
      required: !f.optional,
      unique: uniques.includes( f.fieldType ),
      tags: f.options.map( o => ( {
        label: _monoLabel( o.label ),
        slug: o.value,
        schemaOptionId: [ f.schemaId || schema.id, o.id ].join( '.' )
      } ) )
    } ) )
  }

  return {
    tagSet,
    messages
  }

}

function _monoLabel( label ) {

  if ( _.isString( label ) ) return label;

  return _.get( label, _.first( _.keys( label ) ) );

}
