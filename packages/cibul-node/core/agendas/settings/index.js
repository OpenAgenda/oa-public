"use strict";

const config = require( '../../../config' );

const getMergedSchema = require( './getMergedSchema' );
const getSchema = require( './getSchema' );
const updateTagSetFromSchema = require( './legacy/updateTagSetFromSchema' );
const updateCustomFromSchema = require( './legacy/updateCustomFromSchema' );

const updateFields = require( './updateFields' );

module.exports = agendaUid => {

  return {
    get: getMergedSchema.bind( null, agendaUid ), // deprecate
    schema: {
      get: getSchema.bind( null, agendaUid ),
      getMerged: getMergedSchema.bind( null, agendaUid ),
      updateFields: updateFields.bind( null, config, agendaUid )
    },
    legacy: {
      updateTagSet: updateTagSetFromSchema.bind( null, config, agendaUid ),
      updateCustom: updateCustomFromSchema.bind( null, config, agendaUid )
    }
  }

}
