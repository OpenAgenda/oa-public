"use strict";

const _ = require( 'lodash' );
const VError = require( 'verror' );

const agendaEvents = require( '@openagenda/agenda-events' );

const doAdd = require( '../utils/doAdd' );
const getAgenda = require( '../utils/getAgenda' );
const validate = require( './validate' );

module.exports = async ( agendaUid, eventUid, data ) => {

  const {
    formSchemaId
  } = await getAgenda( agendaUid );

  const added = {};

  // pre-validate data
  const clean = await validate.loaded( { formSchemaId }, data, false );

  // if event is already referenced on agenda, this fails  
  if ( await agendaEvents( agendaUid ).get( eventUid ) ) {

    throw new VError( 'event %s is already referenced by agenda %s', eventUid, agendaUid );

  }

  return doAdd( agendaUid, eventUid, clean, formSchemaId );

}
