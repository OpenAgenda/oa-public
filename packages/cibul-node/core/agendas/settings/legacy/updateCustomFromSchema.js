"use strict";

const _ = require( 'lodash' );
const ih = require( 'immutability-helper' );

const formSchemas = require( '@openagenda/form-schemas' );
const generateCustomSet = require( '@openagenda/legacy/tagsAndCustom' ).utils.generateCustomSet;
const log = require( '@openagenda/logs' )( 'core/agendas/settings/legacy/updateCustom' );

const getAgenda = require( '../../utils/getAgenda' );
const getMergedSchema = require( '../getMergedSchema' );
const getSchema = require( '../getSchema' );
const setSchemaFieldOrigins = require( './setSchemaFieldOrigins' );

module.exports = async ( config, agendaOrUid, force = false ) => {

  const agenda = _.isObject( agendaOrUid ) ? agendaOrUid : await getAgenda( agendaOrUid );

  log( 'transferring from form-schema to custom fields', agenda.uid );

  // get the merged one.
  const schema = await getMergedSchema( agenda );

  if ( !schema ) return { message: `No form schema was found for agenda ${agenda.uid}` };

  const { customFields, messages } = generateCustomSet( schema );

  const {
    id, store
  } = await config.knex( 'review' ).first( [ 'id', 'store' ] ).where( 'uid', agenda.uid );

  const parsedStore = JSON.parse( store );

  if ( !force && _.get( parsedStore, 'customFields', [] ).length ) {

    return {
      message: 'custom fields already exist for agenda. ?force to force operation'
    }

  }

  parsedStore.customFields = customFields;

  await config.knex( 'review' ).update( {
    store: JSON.stringify( parsedStore )
  } ).where( 'uid', agenda.uid );

  messages.push( 'generated customFields' );

  const res = {
    messages,
    customFields
  };

  if ( customFields.length ) {

    const {
      message: schemaUpdateMessage,
      schema: updatedSchema
    } = await setSchemaFieldOrigins( agenda, customFields.map( f => f.name ), 'custom' );

    res.messages.push( schemaUpdateMessage );

    res.updatedSchema = updatedSchema;

  }

  return res;

}
