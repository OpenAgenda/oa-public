"use strict";

const _ = require( 'lodash' );

const aggregator = require( '../../aggregator' );
const config = require( '../../../config' );

const log = require( '@openagenda/logs' )( 'agendaEvents/aggregatorNotify' );

module.exports = {
  create: _catchable( create ),
  update: _catchable( update ),
  remove: _catchable( remove )
}

async function create( { agenda, event, agendaEvent } ) {

  log( 'notify create for event %s on agenda %s with state %s', event.slug, agenda.slug, agendaEvent.state );

  if ( agendaEvent.state === 2 ) {

    await _sleep( 3 );

    const eventId = await _getLegacyEventId( event );

    aggregator.notifyPublish( eventId, agenda.id );

  }

}


async function update( { agenda, event, before, after } ) {

  log( 'notify update for event %s on agenda %s with before state %s and after state %s', event.slug, agenda.slug, before.state, after.state );

  if ( before.state === after.state ) return;

  await _sleep( 3 );

  const eventId = await _getLegacyEventId( event );

  if ( after.state === 2 ) {

    aggregator.notifyPublish( eventId, agenda.id );

    return;

  }

  if ( before.state !== 2 ) return;

  aggregator.notifyUnpublish( eventId, agenda.id );

}


async function remove( { agenda, event, agendaEvent } ) {

  log( 'notify remove for event %s on agenda %s', event.slug, agenda.slug );

  const eventId = await _getLegacyEventId( event );

  await _sleep( 3 );

  aggregator.notifyUnpublish( eventId, agenda.id );

}


async function _sleep( seconds ) {

  return new Promise( rs => setTimeout( rs, seconds * 1000 ) );

}

function _getLegacyEventId( event ) {

  return config.knex.first( 'id' )
    .from( 'event' )
    .where( 'uid', event.uid )
    .then( r => _.get( r, 'id' ) );

}

function _catchable( fn ) {

  return async data => {

    try {

      await fn( data );

    } catch ( e ) {

      log( 'error', e );

    }

  }

}
