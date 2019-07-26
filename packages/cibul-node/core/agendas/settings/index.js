"use strict";

const config = require( '../../../config' );

const getMergedSchema = require( './getMergedSchema' );
const getSchema = require( './getSchema' );
const updateTagSetFromSchema = require( './legacy/updateTagSetFromSchema' );
const updateCustomFromSchema = require( './legacy/updateCustomFromSchema' );
const updateLegacy = require( './legacy/update' );

const updateSchemaFields = require( './updateSchemaFields' );

module.exports = agendaUid => {

  return {
    get: getMergedSchema.bind( null, agendaUid ), // deprecate
    schema: {
      get: getSchema.bind( null, agendaUid ),
      getMerged: getMergedSchema.bind( null, agendaUid ),
      updateFields: updateSchemaFields.bind( null, config, agendaUid )
    },
    legacy: {
      updateTagSet: updateTagSetFromSchema.bind( null, config, agendaUid ),
      updateCustom: updateCustomFromSchema.bind( null, config, agendaUid ),
      update: updateLegacy.bind( null, config, agendaUid )
    }
  }

}
