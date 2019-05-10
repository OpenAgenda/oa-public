"use strict";

const _ = require( 'lodash' );

const custom = require( '@openagenda/custom' );

const getAgenda = require( '../../utils/getAgenda' );
const updateTagSetFromSchema = require( './updateTagSetFromSchema' );
const updateCustomFromSchema = require( './updateCustomFromSchema' );
const resyncLegacyIndex = require( './resyncLegacyIndex' );
const controlData = require( '../../../../services/legacy' ).controlData;

module.exports = async ( config, agendaOrUid, force = false ) => {

  const agenda = _.isObject( agendaOrUid ) ? agendaOrUid : await getAgenda( agendaOrUid );

  await updateTagSetFromSchema( config, agenda, force );

  await updateCustomFromSchema( config, agenda, force );

  await custom.pushCustomDatasetToLegacy( agenda.id );

  await resyncLegacyIndex( agenda.id );

  await controlData.rebuild( agenda.uid );

}
