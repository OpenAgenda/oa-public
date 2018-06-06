"use strict";

const _ = require( 'lodash' );

const async = require( 'async' );

const log = require( '@openagenda/logs' )( 'services/agenda/task' );

const utils = require( '@openagenda/utils' );

const aggregator = require( '../aggregator' );
const coms = require( '../../lib/coms' );
const config = require( '../../config' );
const dispatcher = require( './dispatcher' );
const eventSvc = require( '../event' );
const groupActions = require( './tasks/groupActions' );
const svc = require( './' );


module.exports = function() {

  groupActions();

  coms.subscribe( config.mainChannel, ( err, action ) => {

    if ( err ) return;

    switch ( action.name ) {

      case 'event.create':
      case 'event.update':
      case 'event.delete':

        return _onEventActivity( action );

      case 'review.update':
      case 'agenda.update':

        return _onAgendaActivity( action );

    }

  } );

}


function _onAgendaActivity( action ) {

  svc.get( { id: action.values.id }, function( err, agenda ) {

    if ( err ) {

      log( 'error', 'could not fetch agenda %s: %s', action.values.id, err );

      return;

    }

    const dsp = dispatcher( agenda );

    switch ( ( action.values.type || '' ).split( '.' )[ 0 ] ) {

      case 'contributor':
      case 'moderator':
      case 'administrator':

        return dsp.onSetStakeholder( action.values.userId, action.values.type );

      case 'contribution':
      case 'credentials':
      case 'refresh':

        return dsp.onRefresh();

      default:

        agenda.refreshUpdatedAt();

    }
    

  });

}


function _onEventActivity( action ) {

  log( 'info', action.values.agendaId ? '-- read event %s activity for agenda %s --' : '-- read event %s activity --', action.values.id, action.values.agendaId );

  eventSvc.get( { id: action.values.id }, ( err, event ) => {

    let count = 0;

    if ( err ) return log( 'error', 'could not fetch event %s', action.values.id );

    _forEachRelatedAgenda( event, action.values.agendaId, ( err, agenda, agendaEvent, ecb ) => {

      if ( err ) {

        log( 'error', 'could not fetch event %s in agenda context: %s', action.id, err );

        return ecb();

      }

      const dsp = dispatcher( agenda );

      switch ( action.values.type ) {

        case 'event.featured':
        case 'event.unfeatured':

          dsp.onEventFeaturedChange( event );

        case 'event.publish':

          dsp.onEventPublish( event, action.values );

          break;

        case 'event.remove':
        case 'event.unpublish':

          dsp.onEventUnpublish( event, action.values );

          break;

        case 'event.tagUpdate':
        //case 'event.categoryUpdate': does not exist

          // do nothing, legacy es index catches the same event

          break;

        default: // assuming regular update.

          dsp.onEventUpdate( event, _.extend( { agendaId: agenda.id }, action.values ) );

      }

      count++;

      ecb();

    }, err => {

      log( 'info', 'processed %s agenda update on event %s action %s', count, event.uid, action.name );

    });

  } );

}


function _forEachRelatedAgenda( event, agendaId, eachCb, cb ) {

  if ( agendaId ) {

    svc.get( { id: agendaId }, ( err, a ) => {

      if ( err ) return cb( err );

      event.loadAgendaContext( agendaId, err => {

        if ( err ) return cb( err );

        eachCb( err, svc.instanciate( a ), event, cb );

      } );

    } );

  } else {

    event.getAgendaReferences( { isPublished: null, internal: true }, function( err, agendas ) {

      if ( err ) return cb( err );

      async.eachSeries( agendas, ( a, ecb ) => {

        const agenda = svc.instanciate( a );

        event.loadAgendaContext( a.id, err => {

          if ( err ) return cb( err );

          eachCb( err, agenda, event ? utils.extend( {}, event ) : null, ecb );

        });

      }, cb );

    } );

  }


}