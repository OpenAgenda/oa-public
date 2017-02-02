"use strict";

const validator = require( './validator' );
const camelCase = require( 'lodash/camelCase' );
const extend = require( 'lodash/extend' );

module.exports.fields = [ {
  field: 'organization',
  type: 'text',
  slugged: true, // when a slug should be generated and stored
  params: { min: 2, max: 160 }
}, {
  field: 'contact_number',
  type: 'phone',
  params: {}
}, {
  field: 'contact_name',
  type: 'text',
  params: { min: 2, max: 160 }
}, {
  field: 'contact_position',
  type: 'text',
  params: { min: 2, max: 160 }
}, {
  field: 'email',
  type: 'email',
  params: {}
} ]

// default schema derives from default stakeholder field set
module.exports.schemaMap = validator.convertFieldsToSchemaMap( module.exports.fields );

module.exports.camelCaseSchemaMap = validator.convertFieldsToSchemaMap( module.exports.fields.map( f => extend( {}, f, { field: camelCase( f.field ) } ) ) );