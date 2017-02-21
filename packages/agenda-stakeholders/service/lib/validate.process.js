"use strict"

/**
 * for use in update & create processes
 */

const Stakeholder = require( '../../iso/Stakeholder' ),

  validator = require( '../../iso/validator' ),

  _ = require( 'lodash' );

module.exports = function( { data, allowPartial, settings }, cb ) {

  settings.get( ( err, s ) => {

    if ( err ) return cb( err );

    // handle camel-cased fields only
    const fields = s.fields.map( f => _.extend( {}, f, { field: _.camelCase( f.field ) } ) );

    // settings fields follow a legacy structure ( list of fields )
    // that must be converted to a 'validators/schema' friendly map
    let stakeholder = new Stakeholder( _preClean( data ), {
      schemaMap: validator.convertFieldsToSchemaMap( fields )
    } ),

    valid = stakeholder.isValid( allowPartial );

    cb( null, valid, valid, stakeholder.getErrors( allowPartial ) );

  } );

}


/**
 * data may come in underscored field name version
 * shifting to camelCase only.
 */
function _preClean( data ) {

  let c = _.mapKeys( data, ( v, k ) => _.camelCase( k ) );

  if ( !c || !_.isObject( c ) ) return c;

  if ( !c.organization || !_.isObject( c.organization ) ) return c;

  return _.extend( {}, c, { organization: c.organization.label } );

}