"use strict";

const _ = require( 'lodash' );

const get = require( './get' );
const list = require( './list' );
const getSchema = require( './getSchema' );
const updateSchemaFields = require( './updateSchemaFields' );
const getAgendas = require( './getAgendas' );
const addAgenda = require( './addAgenda' );
const createAgenda = require( './createAgenda' );
const networks = require( '../../services/networks' );

module.exports = services => Object.assign(networkUid => ({
  get: get.bind( null, networkUid ),
  schema: {
    get: getSchema.bind( null, networkUid ),
    updateFields: updateSchemaFields.bind( null, networkUid ),
  },
  agendas: _.assign( getAgendas.bind( null, networkUid ), {
    add: addAgenda.bind( null, services, networkUid ),
    create: createAgenda.bind( null, networkUid )
  } )
}), {
  list,
  create: data => networks.create( data )
});
