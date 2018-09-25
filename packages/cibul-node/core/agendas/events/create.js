"use strict";

const _ = require( 'lodash' );
const ih = require( 'immutability-helper' );
const VError = require( 'verror' );

const events = require( '@openagenda/events' );
const formSchemas = require( '@openagenda/form-schemas' );
const log = require( '@openagenda/logs' )( 'core/agendas/events/create' );

const doAdd = require( '../utils/doAdd' );
const getAgenda = require( '../utils/getAgenda' );
const validate = require( './validate' );

module.exports = async ( agendaUid, data, options = {} ) => {

  log( 'processing data', { agendaUid } );

  const { draft } = _.assign( {
    draft: false
  }, options || {} );

  const {
    formSchemaId,
    id: agendaId
  } = await getAgenda( agendaUid );

  const created = {};

  // pre-validate data
  const clean = await validate.loaded( { formSchemaId }, data, { draft } );

  log( 'pre-validation done', { agendaUid } );

  // create the event
  const result = await events.create( clean.event, { 
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
    draft
  } );

  return {
    success: true,
    created: _.extend( created, addResult.added )
  }

}
