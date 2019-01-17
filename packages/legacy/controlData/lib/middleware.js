"use strict";

const _ = require( 'lodash' );

const loadControlData = require( './utils/loadControlData' );
const { isRebuilding } = require( './rebuild' );
const rebuild = require( './rebuild' );
const queue = require( './queue' );

const log = require( '@openagenda/logs' )( 'controlData/middleware' );

module.exports = async ( { prefix, knex, redis }, req, res, next ) => {

  const agendaUid = _.get( req, 'agenda.uid' );

  if ( !agendaUid ) return next( 'Identifier is missing' );

  log( 'fetching control data for agenda %s', agendaUid );

  try {

    const ctlDataStr = await loadControlData( redis, prefix, agendaUid, {
      parse: false,
      initialize: false
    } );

    if ( ctlDataStr ) {

      return _sendResult( res, agendaUid, ctlDataStr );

    }

    log( 'no control data was retrieved for agenda %s', agendaUid );

    if ( ( await _getPublishedEventsCount( knex, agendaUid ) ) < 300 ) {

      return _sendResult( res, agendaUid, JSON.stringify(
        await rebuild( { prefix, knex, redis }, agendaUid )
      ) );

    }

    if ( !await isRebuilding( redis, prefix, agendaUid ) ) {

      queue( { prefix, redis }, 'rebuild', agendaUid );

    }

    res.json( {
      rebuilding: true
    } );

  } catch ( e ) {

    next( e );

  }

}

function _getPublishedEventsCount( knex, agendaUid ) {

  return knex.count( 'id as count' )
    .from( 'agenda_event' )
    .where( {
      agenda_uid: agendaUid,
      state: 2
    } )
    .then( r => _.first( r ) )
    .then( r => r ? r.count : 0 );

}

function _sendResult( res, agendaUid, ctlDataStr ) {

  log( 'retrieved control data for agenda %s', agendaUid );

  res.set( {
    'Content-Type': 'application/json',
    'Content-Length': ctlDataStr.length
  } );

  res.send( '{"success":true,"code":200,"data":' + ctlDataStr + '}' );

}
