"use strict";

const _ = require( 'lodash' );
const VError = require( 'verror' );

const insert = require( './insert' );
const refreshTimestamp = require( './utils/refreshTimestamp' );
const setCategories = require( './utils/setCategories' );
const setTags = require( './utils/setTags' );
const setMembers = require( './utils/setMembers' );
const setAgendaSettings = require( './utils/setSettings' );
const setSettings = require( './utils/setSettings' );

const log = require( '@openagenda/logs' )( 'controlData/rebuild' );

module.exports = async ( { prefix, knex, redis }, uid ) => {

  const ctl = {
    ev: [], // list of events
    l: [], // list of locations referenced by events
    e: [], // uids of contributors
    adm: [], // uids of administrators
    mod: [], // uids of moderators
    // m: false, // no longer used. Was user's main agenda
    c: 0, // contribution type - CLOSED: 0, OPEN: 1, MEMBERS_ONLY: 2
    ct: [], // list of categories
    tg: [], // list of tag group names
    prv: 0, // 1 if is private
    t: [], // list of tags
    lo: { // last occurrence
      start: null,
      end: null
    },
    sh: true // sync with href
  }

  const agenda = await knex( 'review' ).first( 'id', 'settings', 'private' ).where( 'uid', uid );

  if ( !agenda ) {

    throw new VError( 'agenda was not found', uid );

  }

  await setSettings( ctl, agenda );

  await setCategories( ctl, knex, agenda.id );

  await setTags( ctl, knex, agenda.id );

  await setMembers( ctl, knex, agenda.id );

  let lastId = 0, agendaEvent;

  while( agendaEvent = await knex( 'agenda_event' )
    .first( 'id', 'event_uid as eventUid', 'legacy_id as legacyId' )
    .where( {
      agenda_uid: uid,
      state: 2
    } )
    .where( 'id', '>', lastId )
    .orderBy( 'id' )
  ) {

    lastId = agendaEvent.id;

    const event = await knex( 'event_2' )
      .first( 'uid', 'location_uid as locationUid', 'timings', 'slug', 'timezone' )
      .where( 'uid', agendaEvent.eventUid );

    if ( !event ) {

      log( 'error', 'did not find event %s', agendaEvent.eventUid );

      continue;

    }

    const location = await knex( 'location' )
      .first( 'uid', 'latitude', 'longitude' )
      .where( 'uid', event.locationUid );

    if ( !location ) {

      log( 'error', 'did not find location %s of event %s', event.uid, event.locationUid );

      continue;

    }

    try {

      const inserted = await insert(
        { prefix, knex, redis, loadedCtlData: ctl, skipSave: true },
        _.set( agendaEvent, 'agendaUid', uid ),
        _.assign( event, { location, timings: JSON.parse( event.timings ) } )
      );

      log( 'inserted event %s to agenda %s', agendaEvent.eventUid, uid );

    } catch ( e ) {

      log( 'error', 'failed to insert event %s to agenda %s data', agendaEvent.eventUid, uid, e );

    }

  }

  log( 'info', 'rebuild complete for %s with %s events', uid, ctl.ev.length );

  await redis.set( prefix + uid, JSON.stringify( ctl ) );

  await refreshTimestamp( prefix, redis, uid );

  return ctl;

}
