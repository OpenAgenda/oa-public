"use strict";

const _ = require( 'lodash' );
const VError = require( 'verror' );

const events = require( '@openagenda/events' );
const formSchemas = require( '@openagenda/form-schemas' );

const doAdd = require( '../utils/doAdd' );
const getAgenda = require( '../utils/getAgenda' );
const validate = require( './validate' );

module.exports = async ( agendaUid, data ) => {

  const {
    formSchemaId
  } = await getAgenda( agendaUid );

  const created = {};

  // pre-validate data
  const clean = await validate.loaded( { formSchemaId }, data );

  // create the event
  let result = await events.create( clean.event, { transferToLegacy: true } );

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

  const addResult = await doAdd( agendaUid, created.event.uid, formSchemaId, clean );

  return {
    success: true,
    created: _.extend( created, addResult.added )
  }

}