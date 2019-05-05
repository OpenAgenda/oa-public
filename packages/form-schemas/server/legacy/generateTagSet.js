"use strict";

const _ = require( 'lodash' );

const includeTypes = [ 'radio', 'select', 'checkbox' ];

const uniques = [ 'radio', 'select' ];

module.exports = ( schema, currentTagSet = null ) => {

  const currentTagGroups = _.get( currentTagSet, 'groups', [] );

  const tagSettableFields = schema.fields
    .filter( f => includeTypes.includes( f.fieldType ) );

  const messages = tagSettableFields
    .filter( f => !f.origin )
    .map( f => `${f.field}: field origin is not set` );

  const updatedGroups = tagSettableFields.map( f => {

    const index = currentTagGroups.map( g => g.name ).indexOf( _monoLabel( f.label ) );

    return {
      name: _monoLabel( f.label ),
      required: !f.optional,
      unique: uniques.includes( f.fieldType ),
      tags: _defineTags( f.schemaId, index === -1 ? [] : currentTagGroups[ index ].tags, f.options )
    };

  } );

  return {
    tagSet: {
      groups: updatedGroups
    },
    messages,
    fields: tagSettableFields
  }

}

function _defineTags( schemaId, tags = [], options = [] ) {

  options.forEach( o => {

    let matchingTagIndex = -1;

    const label = _monoLabel( o.label );
    const slug = o.value;
    const schemaOptionId = `${schemaId}.${o.id}`;

    // attempt match on schemaOptionId
    matchingTagIndex = _.findIndex( tags, { schemaOptionId } );

    // attempt match on label
    if ( matchingTagIndex === -1 ) {

      matchingTagIndex = _.findIndex( tags, { label: _monoLabel( o.label ) } );

    }

    if ( matchingTagIndex !== -1 ) {

      _.assign( tags[ matchingTagIndex ], { slug, label, schemaOptionId } );

    } else {

      tags.push( {
        slug,
        label,
        schemaOptionId
      });

    }

  } );

  return tags;

}

function _hasSchemaOptionId( tags ) {

  return !!tags.filter( t => t.schemaOptionId ).length;

}

function _monoLabel( label ) {

  if ( _.isString( label ) ) return label;

  return _.get( label, _.first( _.keys( label ) ) );

}
