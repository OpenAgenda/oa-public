"use strict";

const _ = require( 'lodash' );

const generateCustomFields = require( '@openagenda/form-schemas/server/legacy/generateCustomFields' );
const log = require( '@openagenda/logs' )( 'core/agendas/settings/legacy/updateCustom' );

const getAgenda = require( '../../utils/getAgenda' );
const getMergedSchema = require( '../getMergedSchema' );

module.exports = async ( config, agendaOrUid, force = false ) => {

  const agenda = _.isObject( agendaOrUid ) ? agendaOrUid : await getAgenda( agendaOrUid );

  log( 'transferring from form-schema to custom fields', agenda.uid );

  // get the merged one.
  const schema = await getMergedSchema( agenda );

  if ( !schema ) return { message: `No form schema was found for agenda ${agenda.uid}` };

  const { customFields, messages } = generateCustomFields( schema );

  const {
    id, store
  } = await config.knex( 'review' ).first( [ 'id', 'store' ] ).where( 'uid', agenda.uid );

  const parsedStore = JSON.parse( store );

  if ( !force && _.get( parsedStore, 'customFields', [] ).length ) {

    return {
      message: 'custom fields already exists for agenda. ?force to force operation'
    }

  }

  parsedStore.customFields = customFields;

  await config.knex( 'review' ).update( {
    store: JSON.stringify( parsedStore )
  } ).where( 'uid', agenda.uid );

  messages.push( 'generated customFields' );

  return {
    messages,
    customFields
  }

}
