"use strict";

const _ = require( 'lodash' );
const { promisify } = require( 'util' );

const agendas = require( '@openagenda/agendas' );
const FormSchema = require( '@openagenda/form-schemas/iso/FormSchema' );
const formSchemas = require( '@openagenda/form-schemas' );

const getAgenda = require( '../utils/getAgenda' );
const setAgenda = promisify( agendas.set );
const getSchema = require( './getSchema' );
const updateTagSetFromSchema = require( './legacy/updateTagSetFromSchema' );
const updateCustomFromSchema = require( './legacy/updateCustomFromSchema' );

module.exports = async ( config, agendaOrUid, updatedFields ) => {

  const agenda = _.isObject( agendaOrUid ) ? agendaOrUid : await getAgenda( agendaOrUid );

  const agendaSchema = await getSchema( agenda );

  const fs = new FormSchema( agendaSchema );

  fs.updateFields( updatedFields );

  if ( !agendaSchema ) {

    const { id } = await formSchemas.create( fs.getData() );

    await setAgenda( { uid: agenda.uid }, { formSchemaId: id } );

  } else {

    await formSchemas.update( agendaSchema.id, fs.getData() );

  }

  await updateTagSetFromSchema( config, agenda, true );
  await updateCustomFromSchema( config, agenda, true );

  return true;

}
