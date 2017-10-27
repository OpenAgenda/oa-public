"use strict";

var utils = require( '@openagenda/utils' );

/**
 * errors are a list of objects that contain the following fields
 *   - a message
 *   - a field name
 *   - a group name
 *   - a code
 *   - the origin value of the error
 *   - values relevent to the error ( optional )
 */


module.exports = function( set ) {

  return utils.extend( validate, {
    field: set.field
  } );


  function validate( values, groupIndex ) {

    if ( groupIndex !== undefined ) return validateGroup( set.groups[ groupIndex ], values );

    var errors = [];

    set.groups.forEach( function( group, i ) {

      try {

        validateGroup( group, values );

      } catch( errs ) {

        errors = errors.concat( errs );

      }

    } );

    if ( errors.length ) throw errors;

    // no cleaning for this
    return values;

  }

  function validateGroup( group, values ) {

    if ( !group.required ) return;

    var ids = ( values || [] ).map( function( v ) { return v.id; } );

    if ( !group.tags.filter( function( t ) {

      return ids.indexOf( t.id ) !== -1;

    } ).length ) {

      throw [ {
        field: set.field,
        group: group.name ? group.name : 'Tags',
        code: 'groupTags.required',
        message: 'a selection is required',
        origin: group.tags,
        values: {}
      } ]

    }

    // no cleaning.
    return values;

  }

}