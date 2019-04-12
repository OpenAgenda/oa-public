"use strict";

const _ = require( 'lodash' );
const ih = require( 'immutability-helper' );

const formSchemas = require( '@openagenda/form-schemas' );

const getSchema = require( '../getSchema' );

module.exports = async ( agenda, fieldNames = [], origin = null ) => {

  if ( !fieldNames.length ) return {
    message: 'no fields for which origin needs to be set'
  };

  const schema = await getSchema( agenda );

  if ( !schema ) return {
    message: 'no schema exists for agenda, will not be updated with origin'
  };

  const schemaFieldNames = schema.fields.map( f => f.field );

  const update = fieldNames
    .map( f => schemaFieldNames.indexOf( f ) )
    .reduce( ( update, fieldIndex ) => {

      if ( fieldIndex === -1 ) return update;

      return _.set( update, `fields.${fieldIndex}.origin`, { $set: origin } );

    }, { fields: {} } );

  if ( !_.keys( update.fields ).length ) return {
    message: 'no fields found to set the origin on'
  };

  return {
    message: `origin ${origin} set on ${_.keys( update.fields ).length} fields`,
    schema: await formSchemas.update( agenda.formSchemaId, ih( schema, update ) )
  }

}
