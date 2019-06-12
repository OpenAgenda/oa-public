"use strict";

const formSchema = require( '@openagenda/form-schemas' );
const FormSchema = require( '@openagenda/form-schemas/iso/FormSchema' );
const formSchemas = require( '@openagenda/form-schemas' );

const log = require( '@openagenda/logs' )( 'core/networks/updateSchemaFields' );

const getNetwork = require( './get' );
const patchNetwork = require( './patch' );
const getAgendas = require( './getAgendas' );
const agendasCore = require( '../agendas' );
const tasks = require( '../tasks' );

tasks.register( {
  agendaLegacySettingsUpdate: ( agendaUid, force ) => agendasCore( agendaUid ).settings.legacy.update( force )
} );

module.exports = async ( networkUid, updatedFields ) => {

  const network = await getNetwork( networkUid );

  if ( !network ) {
    throw new Error( 'network not found' );
  }

  const networkSchema = network.formSchemaId
    ? await formSchemas.get( network.formSchemaId )
    : null;

  if ( network.formSchemaId && !networkSchema ) {
    throw new Error( 'network form schema not found' );
  }

  const fs = new FormSchema( networkSchema );

  fs.updateFields( updatedFields );

  if ( !networkSchema ) {

    log( 'no schema is associated with network, creating' );

    const { id } = await formSchemas.create( fs.getData() );

    await patchNetwork( network.uid, { formSchemaId: id } );

  } else {

    await formSchemas.update( network.formSchemaId, fs.getData() );

  }

  const agendas = await getAgendas(networkUid );

  log( 'updating legacy models for %s agendas', agendas.length );

  // all agendas must have their legacy models resynced.
  for ( const agenda of agendas ) {

    tasks.enqueue( 'agendaLegacySettingsUpdate', agenda.uid, true );

  }

}
