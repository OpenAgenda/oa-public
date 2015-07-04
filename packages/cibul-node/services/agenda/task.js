var log = require( '../../lib/logger' )( 'agenda task' ),

svc = require( './' ),

utils = require( 'utils' ),

eventSvc = require( '../event' ),

coms = require( '../../lib/coms' ),

cmn = require( '../../lib/commons-task' ),

async = require( 'async' ),

config = require( '../../config' );

module.exports = {
  load: cmn.makeLoad( run )
}

function run() {

  coms.subscribe( config.mainChannel, function( err, action ) {

    if ( err ) return;

    if ( [ 'event.create', 'event.update' ].indexOf( action.name ) == -1 ) return;

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

        _clearTimestamp( agenda );
        
        // _emailStrategie( agenda, agendaEvent );

        ecb();

      }, function() {

        log( 'info', 'processed agenda references on event %s action %s', event.uid, action.name );

      });

    } );

  } );

}


function _clearTimestamp( agenda ) {

  agenda.save( { updatedAt: new Date() }, function( err ) {

    if ( err ) log( 'error', 'could not clear timestamp of agenda %s', agenda.uid );

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

  event.getAgendaReferences( { isPublished: null }, function( err, agendas ) {

    async.eachSeries( agendas, function( a, ecb ) {

      var agenda = svc.instanciate( a );

      event.loadAgendaContext( a.id, function( err ) {

        eachCb( err, agenda, event ? utils.extend( {}, event ) : null, ecb );

      });

    }, cb );

  } );

}