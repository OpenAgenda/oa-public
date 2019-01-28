"use strict";

const _ = require( 'lodash' );

const formSchemas = require( '@openagenda/form-schemas' );
const config = require( '../../../config' );
const generateCustomFields = require( '@openagenda/form-schemas/server/legacy/generateCustomFields' );

const log = require( '@openagenda/logs' )( 'services/agendaStatistics/formSchemaToCustom' );

module.exports = async ( agenda, force ) => {

  log( 'transferring from form-schema to custom fields', agenda.uid );

  // get the merged one.
  const schema = await formSchemas.get( agenda.formSchemaId );

  if ( !schema ) return { message: `No form schema was found for agenda ${agenda.uid}` };

  const customFields = generateCustomFields( schema );

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

  return {
    message: 'generated customFields',
    customFields
  }

}
