"use strict";

const get = require( './get' );
const getSchema = require( './getSchema' );
const getAgendas = require( './getAgendas' );
const addAgenda = require( './addAgenda' );

module.exports = networkUid => {

  return {
    get: get.bind( null, networkUid ),
    getSchema: getSchema.bind( null, networkUid ),
    getAgendas: getAgendas.bind( null, networkUid ),
    addAgenda: addAgenda.bind( null, networkUid )
  }

}

module.exports.list = () => networks.list();
