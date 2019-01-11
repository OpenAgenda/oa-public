"use strict";

const _ = require( 'lodash' );

const loadControlData = require( './utils/loadControlData' );
const loadReviewArticleData = require( './utils/loadReviewArticleData' );
const updateLastOccurrence = require( './utils/updateLastOccurrence' );
const parseEvent = require( './utils/parseEvent' );
const refreshTimestamp = require( './utils/refreshTimestamp' );
const setLocationReference = require( './utils/setLocationReference' );

module.exports = async ( { prefix, knex, redis, loadedCtlData }, agendaEvent, data ) => {

  const { agendaUid, legacyId } = agendaEvent;

  const ctlData = loadedCtlData || await loadControlData( redis, prefix, agendaUid );

  const { c, t, org } = await loadReviewArticleData( knex, legacyId );

  const parsed = { event: parseEvent( data, { c, t, org } ) };

  ctlData.ev.push( parsed.event );

  parsed.location = setLocationReference( ctlData, data.location );

  updateLastOccurrence( ctlData, data.timings );

  await redis.set( prefix + agendaUid, JSON.stringify( ctlData ) );

  await refreshTimestamp( prefix, redis, agendaUid );

  return parsed;

}
