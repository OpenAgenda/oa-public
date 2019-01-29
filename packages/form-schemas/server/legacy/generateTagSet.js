"use strict";

const _ = require( 'lodash' );

const includeTypes = [ 'radio', 'select', 'checkbox' ];

const uniques = [ 'radio', 'select' ];

module.exports = schema => {

  const tagSettableFields = schema.fields
    .filter( f => includeTypes.includes( f.fieldType ) );

  if ( !tagSettableFields.length ) return null;

  return {
    groups: tagSettableFields.map( f => ( {
      name: _monoLabel( f.label ),
      required: !f.optional,
      unique: uniques.includes( f.fieldType ),
      tags: f.options.map( o => ( {
        label: _monoLabel( o.label ),
        slug: o.value
      } ) )
    } ) )
  }

}

function _monoLabel( label ) {

  if ( _.isString( label ) ) return label;

  return _.get( label, _.first( _.keys( label ) ) );

}
