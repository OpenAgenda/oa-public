"use strict";

const _ = require( 'lodash' );
const { promisify } = require( 'util' );

const agendas = require( '@openagenda/agendas' );
const FormSchema = require( '@openagenda/form-schemas/iso/FormSchema' );
const formSchemas = require( '@openagenda/form-schemas' );
const log = require( '@openagenda/logs' )( 'core/agendas/settings/updateFields' );

const getAgenda = require( '../utils/getAgenda' );
const setAgenda = promisify( agendas.set );
const getSchema = require( './getSchema' );
const updateTagSetFromSchema = require( './legacy/updateTagSetFromSchema' );
const updateCustomFromSchema = require( './legacy/updateCustomFromSchema' );
const controlData = require( '../../../services/legacy' ).controlData;

module.exports = async ( config, agendaOrUid, updatedFields ) => {

  const agenda = _.isObject( agendaOrUid ) ? agendaOrUid : await getAgenda( agendaOrUid );

  const agendaSchema = await getSchema( agenda );

  const fs = new FormSchema( agendaSchema );

  fs.updateFields( updatedFields );

  if ( !agendaSchema ) {

    log( 'no schema is associated with agenda, creating' );

    const { id } = await formSchemas.create( fs.getData() );

    await setAgenda( { uid: agenda.uid }, { formSchemaId: id }, { protected: false } );

    _.set( agenda, 'formSchemaId', id );

  } else {

    log( 'schema is associated with agenda, updating' );

    await formSchemas.update( agendaSchema.id, fs.getData() );

  }

  await updateTagSetFromSchema( config, agenda, true );
  await updateCustomFromSchema( config, agenda, true );
  await controlData.setTags( agenda.uid );

  return true;

}
