"use strict";

const _ = require( 'lodash' );
const VError = require( 'verror' );

const loadControlData = require( './utils/loadControlData' );
const loadReviewArticleData = require( './utils/loadReviewArticleData' );
const parseEvent = require( './utils/parseEvent' );
const refreshTimestamp = require( './utils/refreshTimestamp' );
const setLocationReference = require( './utils/setLocationReference' );
const updateLastOccurrence = require( './utils/updateLastOccurrence' );

module.exports = async ( { prefix, knex, redis, index, loadedCtlData }, agendaEvent, data ) => {

  const { eventUid, agendaUid, legacyId } = agendaEvent;

  const ctlData = loadedCtlData || await loadControlData( redis, prefix, agendaUid );

  const eventIndex = index || _.findIndex( ctlData.ev, { u: eventUid } );

  if ( eventIndex === -1 ) throw new VError( 'did not find event %s in ctl data of agenda %s', eventUid, agendaUid );

  const { c, t, org } = await loadReviewArticleData( knex, legacyId );

  const parsed = { event: parseEvent( data, { c, t, org } ) };

  ctlData.ev[ eventIndex ] = parsed.event;

  parsed.location = setLocationReference( ctlData, data.location );

  updateLastOccurrence( ctlData, data.timings );

  await redis.set( prefix + agendaUid, JSON.stringify( ctlData ) );

  await refreshTimestamp( prefix, redis, agendaUid );

  return parsed;

}
