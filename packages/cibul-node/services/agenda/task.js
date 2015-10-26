var log = require( 'logger' )( 'agenda task' ),

svc = require( './' ),

utils = require( 'utils' ),

eventSvc = require( '../event' ),

coms = require( '../../lib/coms' ),

async = require( 'async' ),

config = require( '../../config' ),

groupActions = require( './tasks/groupActions' );

module.exports = function() {

  groupActions();

  coms.subscribe( config.mainChannel, function( err, action ) {

    if ( err ) return;

    if ( [ 'event.create', 'event.update' ].indexOf( action.name ) !== -1 ) {

      _onEventActivity( action );

    }

    // legacy php project change on agenda
    if ( action.name == 'review.update' ) {

      _onAgendaActivity( action );

    }

  } );

}


function _onAgendaActivity( action ) {

  svc.get( { id: action.values.id }, function( err, agenda ) {

    if ( err ) {

      log( 'error', 'could not fetch agenda %s', agenda.id );

      return;

    }

    agenda.refresh();

  });

}


function _onEventActivity( action ) {

  eventSvc.get( { id: action.values.id }, function( err, event ) {

    if ( err ) {

      log( 'error', 'could not fetch event %s', event.id );

      return;

    }

    _forEachRelatedAgenda( event, function( err, agenda, agendaEvent, ecb ) {

      if ( err ) {

        log( 'error', 'could not fetch event %s in agenda context: %s', action.id, err );

        return ecb();

      }

      agenda.refresh();

      ecb();

    }, function() {

      log( 'info', 'processed agenda references on event %s action %s', event.uid, action.name );

    });

  } );

}


function _emailStrategie( agenda, event ) {

  agenda.emailStrategie.isLinked( function( err, is ) {

    if ( err ) return cb( err );

    if ( !is ) return;

    agenda.emailStrategie.setEvent( event, function( err ) {

      if ( err ) log( 'error', 'could not updated emailstrategie on agenda %s and event %s', agenda.uid, event.uid );

    } );

  });

}


function _forEachRelatedAgenda( event, eachCb, cb ) {

  event.getAgendaReferences( { isPublished: null, internal: true }, function( err, agendas ) {

    async.eachSeries( agendas, function( a, ecb ) {

      var agenda = svc.instanciate( a );

      event.loadAgendaContext( a.id, function( err ) {

        eachCb( err, agenda, event ? utils.extend( {}, event ) : null, ecb );

      });

    }, cb );

  } );

}