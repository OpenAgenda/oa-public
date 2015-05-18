var log = require( '../../lib/logger' )( 'agenda task' ),

svc = require( './agenda' ),

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

    if ( action.name === 'event.update' ) {

      _clearTimestamps( action.values.id );

    }

  } );

}

function _clearTimestamps( eventId ) {

  eventSvc.get( { id: eventId }, function( err, event ) {

    if ( err ) return log( 'error', err );

    event.getAgendaReferences( { isPublished: null }, function( err, agendas ) {

      async.eachSeries( agendas.map( svc.instanciate ), function( agenda, ecb ) {

        log( 'refreshing timestamp of agenda %s', agenda.slug );

        agenda.save( { updatedAt: new Date() }, ecb );

      } );

    });

  });

}