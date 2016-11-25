"use strict";

var log = require( 'logger' )( 'invitation svc' ),

agendaInvitations = require( './agenda' ),

coms = require( '../../lib/coms' ),

config = require( '../../config' ),

model = require( '../model' ),

agendaSvc = require( '../agenda' ),

mail = require( './mail' ),

async = require( 'async' ),

w = require( 'when' ),

TYPES = {
  AGENDACONTRIBUTOR: 1,
  AGENDAADMIN: 2,
  AGENDAMODERATOR: 3
};

module.exports = {
  agenda: agendaInvitations,
  addJob: addJob,
  processUser: processUser,
  preprocessUser: preprocessUser,

  // route invitation to internal service based on its type
  processInvitation: processInvitation,
  getComs: getComs,

  // load invitation from mail@ part of email
  // or define mail@ part
  mail: mail

}

agendaInvitations.init( module.exports );

/**
 * add a job for an invitation to be processed
 */

function addJob( invitation, lang, cb ) {

  log( 'queuing job for invitation %s', JSON.stringify( invitation ) );

  coms.queue( 'jobs', { 
    type: 'invitation/index',
    invitationId: invitation.id, 
    action: 'processInvitation', 
    lang: lang
  }, cb );

}


/**
 * load, then dispatch invitation according to its type
 */

function processInvitation( values, cb ) {

  log( 'processing invitation %s', JSON.stringify( values ) );

  _loadInvitation( values )

  .then( _loadAgenda )

  .then( values => {

    if ( values.invitation.type == TYPES.AGENDACONTRIBUTOR ) {

      return agendaInvitations( values.agenda ).processContributorInvitation( values );
      
    } else if ( values.invitation.type == TYPES.AGENDAADMIN ) {

      return agendaInvitations( values.agenda ).processAdministratorInvitation( values );

    } else if ( values.invitation.type == TYPES.AGENDAMODERATOR ) {

      return agendaInvitations( values.agenda ).processModeratorInvitation( values );

    } else {

      log( 'error', 'invitation type unknown: %s', JSON.stringify( values.invitation ) );

      values.resolved = true;

      return values;

    }

  } )

  .then( _if( 'resolved', true, _clearInvitation ) )

  .done( function( values ) {

    log( 'successfully processed invitation with values %s', JSON.stringify( values ) );

    if ( cb ) cb( null, values );

  }, cb );

}


/**
 * process user invitations once user has been activated
 */

function processUser( values, cb ) {

  var p;

  log( 'processing user invitations with values %s', JSON.stringify( values ) );

  if ( !values.user.isActivated ) {

    log( 'user is not yet activated' );

    return preprocessUser( values, cb );

  }

  p = _loadInvitations( values )

  .then( function( invitations ) {



    return w.promise( function( resolve, reject ) {

      async.eachSeries( invitations, function( invitation, ecs ) {

        processInvitation( {
          invitation: invitation,
          user: values.user
        }, ecs );

      }, function( err ) {

        if ( err ) return reject( err );

        values.count = invitations.length;

        resolve( values );

      });

    } );

  } );

  if ( !cb ) return p;

  w( p ).then( function( values ) { cb( null, values ); }, cb );

}


function preprocessUser( values, cb ) {

  var p;

  log( 'pre-processing user invitations with values %s', JSON.stringify( values ) );

  if ( values.user.isActivated ) {

    log( 'user is already activated' );

    p = w( values );

  } else {

    p = _loadInvitations( values, [ TYPES.AGENDACONTRIBUTOR, TYPES.AGENDAADMIN, TYPES.AGENDAMODERATOR ] )

    .then( _loadInvitationAgendas )

    .then( function( invitations ) {

      if ( !invitations.length ) {

        log( 'no invitations to preprocess' );

        return w( values );

      }

      return w.promise( function( resolve, reject ) {

        async.eachSeries( invitations, function( invitation, ecb ) {

          if ( !invitation.agenda ) return ecb();

          invitation.agenda.hasCredential( 'activatingInvitations', function( err, has ) {

            if ( err ) return ecb( err );

            if ( !has ) return ecb();

            // agenda has cred, user should be activated
            
            model.users().update( { id: values.user.id }, { isActivated: true }, function( err, user ) {

              if ( err ) return ecb( err );

              log( 'activated user' );

              values.user.isActivated = true;

              resolve( values );

            } );

          });

        }, function( err ) {

          if ( err ) return reject( err );

          resolve( values );

        } );

      });

    });
    
  }


  if ( !cb ) return p;

  w( p ).then( function( values ) { cb( null, values ) }, cb );

}



function getComs() {

  return coms;

}

function _clearInvitation( values ) {

  return w.promise( function( resolve, reject ) {

    model.invitations().remove( values.invitation, function( err ) {

      if ( err ) return reject( err );

      resolve( values );

    } );

  });

}

function _if( field, expectedValue, func ) {

  return function( values ) {

    if ( values[ field ] !== expectedValue ) return w( values );

    return func( values );

  }

}

function _loadInvitationAgendas( invitations ) {

  return w.promise( function( resolve, reject ) {

    async.each( invitations, function( invitation, ecb ) {

      agendaSvc.get( { id: invitation.aggregatorId }, function( err, agenda ) {

        if ( err ) return ecb( err );

        invitation.agenda = agenda;

        ecb();

      } );

    }, function( err ) {

      if ( err ) return reject( err );

      resolve( invitations );        

    });

  });

}


function _loadInvitations( values, types ) {

  return w.promise( function( resolve, reject ) {

    var listParams = { 
      userId: values.user.id,
      email: values.user.email
    }

    if ( values.iToken ) listParams.token = values.iToken;

    log( 'retrieving user invitations with %s', JSON.stringify( listParams ) );

    model.invitations().orsList( listParams, function( err, invitations ) {

      if ( err ) return reject( err );

      resolve( invitations.filter( function( i ) {

        if ( types && ( types.indexOf( i.type ) == -1 ) ) return false

        return true;

      }) );

    } );

  });

}

function _loadInvitation( values ) {

  if ( values.invitation ) return w( values );

  return w.promise( function( resolve, reject ) {

    model.invitations().get( { id: values.invitationId }, function( err, invitation ) {

      if ( err ) return reject( err );

      values.invitation = invitation;

      resolve( values );

    } );

  });

}



function _loadAgenda( values ) {

  if ( !values.invitation || !values.invitation.aggregatorId ) return w( values );

  return w.promise( function( resolve, reject ) {

    agendaSvc.get( { id: values.invitation.aggregatorId }, function( err, agenda ) {

      if ( err ) return reject( err );

      if ( !agenda ) return reject( 'agenda was not found' );

      values.agenda = agenda;

      resolve( values );

    } );

  });

}