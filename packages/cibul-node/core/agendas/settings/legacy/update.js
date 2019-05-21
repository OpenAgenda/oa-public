"use strict";

const _ = require( 'lodash' );

const custom = require( '@openagenda/custom' );
const log = require( '@openagenda/logs' )( 'core/agendas/settings/legacy/update' );

const getAgenda = require( '../../utils/getAgenda' );
const updateTagSetFromSchema = require( './updateTagSetFromSchema' );
const updateCustomFromSchema = require( './updateCustomFromSchema' );
const resyncLegacyIndex = require( './resyncLegacyIndex' );
const controlData = require( '../../../../services/legacy' ).controlData;


module.exports = async ( config, agendaOrUid, force = false ) => {

  const agenda = _requiresAgendaLoad( agendaOrUid ) ? await getAgenda( agendaOrUid ) : agendaOrUid;

  log( 'syncing legacy config and data of agenda %s (%s)%s', agenda.uid, agenda.slug, force ? ' forced' : '' );

  await updateTagSetFromSchema( config, agenda, force );

  await updateCustomFromSchema( config, agenda, force );

  await custom.pushCustomDatasetToLegacy( agenda.id );

  await resyncLegacyIndex( agenda.id );

  await controlData.rebuild( agenda.uid );

}

function _requiresAgendaLoad( agendaOrUid ) {

  if ( !_.isObject( agendaOrUid ) ) return true;

  return _.keys( agendaOrUid )
    .filter( f => [ 'id', 'networkUid', 'formSchemaId' ].includes( f ) )
    .length !== 3;

}
