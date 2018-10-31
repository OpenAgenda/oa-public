"use strict";

const _ = require( 'lodash' );
const ih = require( 'immutability-helper' );
const VError = require( 'verror' );

const events = require( '@openagenda/events' );
const formSchemas = require( '@openagenda/form-schemas' );
const log = require( '@openagenda/logs' )( 'core/agendas/events/create' );

const doAdd = require( '../utils/doAdd' );
const getAgenda = require( '../utils/getAgenda' );
const getNetwork = require( '../utils/getNetwork' );
const processOEmbed = require( '../utils/processOEmbed' );
const validate = require( './validate' );

module.exports = async ( agendaUid, data, options = {} ) => {

  log( 'processing', { agendaUid, options } );

  const { draft } = _.assign( {
    draft: false
  }, options || {} );

  const {
    formSchemaId,
    networkUid,
    id: agendaId
  } = await getAgenda( agendaUid );

  const network = await getNetwork( networkUid );

  const created = {};

  // pre-validate data
  const clean = await validate.loaded( { 
    formSchemaId,
    networkFormSchemaId: _.get( network, 'formSchemaId' )
  }, data, { draft } );

  try {

    clean.event.links = await processOEmbed( clean.event.longDescription, clean.event.links );

    log( 'retrieved %s links', clean.event.links.length );

  } catch ( e ) {

    log( 'error', 'could not retrieve oembeds', e );

  }

  log( 'pre-validation done', { agendaUid } );

  // create the event
  const result = await events.create( clean.event, {
    context: {
      userUid: _.get( options, 'context.userUid', null )
    },
    transferToLegacy: !draft,
    draft
  } );

  if ( !result.valid ) {

    throw new VError( {
      name: 'validationError',
      info: {
        errors: result.errors
      }
    } );

  } else {

    created.event = result.event;

  }

  const addResult = await doAdd( agendaUid, created.event.uid, ih( clean, {
    agendaEvent: {
      canEdit: { $set: true }
    },
    // required for custom legacy sync only.
    agendaId: { $set: agendaId }
  } ), { 
    formSchemaId,
    networkFormSchemaId: _.get( network, 'formSchemaId' ),
    draft
  } );

  return {
    success: true,
    created: _.extend( created, addResult.added )
  }

}
