"use strict";

const config = require( '../../../config' );

const getMergedSchema = require( './getMergedSchema' );
const getSchema = require( './getSchema' );
const updateLegacySetFromSchema = require('./legacy/updateLegacySetFromSchema');
const updateCustomFromSchema = require('./legacy/updateCustomFromSchema');
const updateLegacy = require( './legacy/update' );

const updateSchemaFields = require( './updateSchemaFields' );

module.exports = agendaUid => {

  return {
    get: getMergedSchema.bind( null, agendaUid ), // deprecate
    schema: {
      get: getSchema.bind(null, agendaUid),
      getNetwork: getSchema.network.bind(null, agendaUid),
      getMerged: getMergedSchema.bind( null, agendaUid ),
      updateFields: updateSchemaFields.bind( null, config, agendaUid )
    },
    legacy: {
      updateTagSet: updateLegacySetFromSchema.bind(null, config, agendaUid, 'tags'),
      updateCategorySet: updateLegacySetFromSchema.bind(null, config, agendaUid, 'categories'),
      updateCustom: updateCustomFromSchema.bind( null, config, agendaUid ),
      update: updateLegacy.bind( null, config, agendaUid )
    }
  }

}
