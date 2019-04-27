"use strict";

const get = require( './get' );
const list = require( './list' );
const getSchema = require( './getSchema' );
const updateSchemaFields = require( './updateSchemaFields' );
const getAgendas = require( './getAgendas' );
const addAgenda = require( './addAgenda' );

module.exports = networkUid => {

  return {
    get: get.bind( null, networkUid ),
    schema: {
      get: getSchema.bind( null, networkUid ),
      updateFields: updateSchemaFields.bind( null, networkUid ),
    },
    getAgendas: getAgendas.bind( null, networkUid ),
    addAgenda: addAgenda.bind( null, networkUid )
  }

}

module.exports.list = list;
