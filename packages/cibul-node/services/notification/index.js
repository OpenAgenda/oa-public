"use strict";

/**
 * service handles queuing and processing notification-related jobs
 *
 * service is responsible for determining how many notifications to
 * be created for each notification creation event.
 *
 * service is also responsible for sending mailer jobs when required
 *
 * notification model validates and creates notifications one by one in db
 *
 * example: a new contributor in an agenda generates one notification
 * for each administrator of the agenda.
 *
 */

var log = require( '@openagenda/logs' )( 'notification-service' ),

coms = require( '../../lib/coms' ),

async = require( 'async' ),

w = require( 'when' ),

config = require( '../../config' ),

model = require( '../model' ),

coms = require( '../../lib/coms' ),

wn = require( 'when/node' ),

lib = require( '../../lib/lib' ),

TYPES = model.notifications().TYPES;

module.exports = {
  notify: {
    // removed legacy notifications
    newContributor: cb => cb(), //_notify( TYPES.AGENDA.NEWCONTRIBUTOR ),
    iAmNewContributor: cb => cb(), //_notify( TYPES.AGENDA.IAMNEWCONTRIBUTOR ),
    newAdministrator: cb => cb(), //_notify( TYPES.AGENDA.NEWADMINISTRATOR ),
    iAmNewModerator: cb => cb(), //_notify( TYPES.AGENDA.IAMNEWMODERATOR ),
    newModerator: cb => cb(), //_notify( TYPES.AGENDA.NEWMODERATOR ),
    iAmNewAdministrator: cb => cb(), //_notify( TYPES.AGENDA.IAMNEWADMINISTRATOR ),
    expiredSwapcard: cb => cb(), //_notify( TYPES.AGENDA.EXPIREDSWAPCARD ),
    newSource: () => {} //newSource
  },
  process: process,
  initless: true
};


function newSource( data ) {

  data.name = 'notification';

  coms.queue( config.legacyQueue, JSON.stringify( data ), { raw: true } );

}


function process( data, cb ) {

  var values = data.values,

  type = values.type;

  if ([
    TYPES.AGENDA.NEWCONTRIBUTOR,
    TYPES.AGENDA.EXPIREDSWAPCARD,
    TYPES.AGENDA.NEWADMINISTRATOR,
    TYPES.AGENDA.NEWMODERATOR
  ].indexOf( type ) !== -1 ) {

    return _createAdminNotifications( type, values, cb );

  } else if ( [
    TYPES.AGENDA.IAMNEWCONTRIBUTOR,
    TYPES.AGENDA.IAMNEWADMINISTRATOR,
    TYPES.AGENDA.IAMNEWMODERATOR,
  ].indexOf( type ) !== -1 ) {

    return _createMyNotification( type, values, cb );

  }

  log( 'error', 'unhandled type %s', type );

  cb();

}


function _createMyNotification( type, data, cb ) {

  model.notifications().create[ type ]( data, ( err, result ) => {

    if ( err ) return cb( err );

    if ( !result.notification ) log( 'error', 'could not create notification: %s', JSON.stringify( result ) );

    cb();

  } );

}


function _createAdminNotifications( type, data, cb ) {

  w( { entry: data } )

  .then( _loadAgendaAdministrators )

  .done( function( values ) {

    async.each( values.administrators, function( admin, ecb ) {

      model.notifications().create[ type ]( lib.extend( values.entry, {
        userId: admin.id
      } ), function( err, result ) {

        if ( err ) return ecb( err );

        if ( !result.notification ) log( 'error', 'could not create notification: %s', JSON.stringify( result ) );

        ecb();

      } );

    }, cb );

  }, function( err ) {

    log( 'error', 'could not create notifications %s', JSON.stringify( data ) );

  } );

}


function _loadAgendaAdministrators( values ) {

  return wn.call( model.reviews().get, { id: values.entry.reviewId || values.entry.agendaId } )

  .then( function( agenda ) {

    if ( !agenda ) throw 'no agenda found for id ' + values.reviewId;

    values.agenda = model.reviews().instance( agenda );

    return wn.call( values.agenda.getAdministrators );

  })

  .then( function( administrators ) {

    values.administrators = administrators.filter( a => a.id !== values.entry.ownerId );

    return values;

  });
}


function _notify( type ) {

  return function( data, cb ) {

    if ( data.userId === undefined ) {

      data.userId = false;

    }

    model.notifications().cleanAndValidate[ type ]( data, false, ( err, result ) => {

      if ( !_isValid( type, err, result ) ) {

        return cb ? cb( err ) : null;

      }

      _queue( type, result.clean, cb );

    } );

  }

}


function _queue( type, data, cb ) {

  log( 'queueing %s, %s', type, JSON.stringify( data ) );

  coms.queue( 'jobs', {
    type: 'notification',
    action: 'process',
    values: lib.extend({}, data, { type: type } )
  }, function( err ) {

    if ( err ) log( 'error', 'got an error while queuing type %s and data %s', type, JSON.stringify( data ) );

    if ( cb ) cb( err );

  } );

}


/**
 * handle an invalid notification queuing request
 */

function _isValid( type, err, result ) {

  if ( err ) {

    log( 'error', 'notification validation error: %s', JSON.stringify( err ) );

    return false;

  }

  if ( !result.clean ) {

    log( 'error', 'data submitted for notification type %s is not valid: %s', type, JSON.stringify( result ) );

    return false;

  }

  return true;

}
