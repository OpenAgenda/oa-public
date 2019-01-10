"use strict";

const _ = require( 'lodash' );

const insert = require( './insert' );
const update = require( './update' );
const loadControlData = require( './utils/loadControlData' );

module.exports = async ( { prefix, knex, redis }, agendaEvent, data ) => {

  const { eventUid, agendaUid } = agendaEvent;

  const ctlData = await loadControlData( redis, prefix, agendaUid );

  const eventIndex = _.findIndex( ctlData.ev, { u: eventUid } );

  if ( eventIndex === -1 ) {

    return insert( { prefix, knex, redis, loadedCtlData: ctlData }, agendaEvent, data );

  } else {

    return update( { prefix, knex, redis, loadedCtlData: ctlData, index: eventIndex }, agendaEvent, data );

  }

}
