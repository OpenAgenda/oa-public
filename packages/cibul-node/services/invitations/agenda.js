"use strict";

var log = require( '../../lib/logger' )( 'invitation svc - agenda' ),

lib = require( '../../lib/lib' ),

i18n = require( '../../i18n/i18n' ),

router = require( '../../lib/router' ),

config = require( '../../config' ),

async = require( 'async' ),

w = require( 'when' ),

model = require( 'cibulModel' )( config.db ),

invitationsService;


module.exports = agendaInvitations;

agendaInvitations.process = process;

agendaInvitations.init = init;


function init( svc ) {

  invitationsService = svc;

}

function agendaInvitations( agenda ) {

  return {
    inviteContributors: inviteContributors,
    inviteContributor: inviteContributor,
    processContributorInvitation: processContributorInvitation
  }

  function inviteContributor( email, lang, cb ) {

    agenda.getContributorInvite( { email: email }, true, function( err, invitation ) {

      if ( err ) return cb( err );

      if ( invitation ) {

        invitationsService.addJob( invitation, lang, cb );

      } else {

        cb( null, null, data );

      }

    });

  }

  function inviteContributors( emails, lang, cb ) {

    var result = {
      errors: []
    },

    invitations = [];

    async.eachSeries( _splitEmails( emails ), function( email, ecb ) {

      agenda.getContributorInvite( { email: email }, true, function( err, invitation, data ) {

        if ( err ) return ecb( err );
        
        if ( invitation ) {

          invitations.push( invitation );

        } else {

          result.errors.push( { email: email, errors: data.errors } );

        }

        ecb();

      });

    }, function( err ) {

      if ( err ) cb( err );

      async.each( invitations, function( invitation, ecb ) {

        invitationsService.addJob( invitation, lang, ecb );

      }, function( err ) {

        cb( err, invitations, result );  

      });

    } );

  }
  
  function processContributorInvitation( values ) {

    log( 'processing contributor invitation' );

    // if user exists and is activated, process, else send invite.
    
    return _attemptLoadUser( values )

    .then( function( values ) {

      if ( !values.user || !values.user.isActivated ) {

        return _sendInvitation( values );

      } else {

        return _createContributor( values );

      }

    });

  }
  
  function _sendInvitation( values ) {

    return w.promise( function( resolve, reject ) {

      agenda.getLanguage( function( err, lang ) {

        if ( values.lang ) lang = values.lang;

        if ( err ) return reject( err );

        var link = _genUrl( 'signin', { iToken: values.invitation.token } ),

        title = 'You have been invited to become contributor of the agenda %agenda%',

        text = 'Click here to start contributing to the agenda %agenda%';

        // owner invitation language sounds good

        invitationsService.getComs().queue( 'mailer', {
          recipient: values.invitation.email,
          subject: i18n( title, { '%agenda%' : agenda.title }, lang ? lang : 'en' ),
          text: i18n( text, { '%agenda%' : agenda.title }, lang ? lang : 'en' ) + "\n" + link
        }, function( err ) {

          if ( err ) return reject( err );

          resolve( values );

        } );

      });


    } );

  }

  function _createContributor( values ) {

    return w.promise( function( resolve, reject ) {

      agenda.isContributor( values.user, function( err, is ) {
        
        if ( err ) return reject( err );

        if ( is ) {

          values.message = i18n( 'You are already a contributor', values.lang );

          values.resolved = true;

          resolve( values );

        } else {

          agenda.setContributor( values.user, function( err ) {

            if ( err ) return reject( err );

            values.message = i18n( 'You are now a contributor of agenda %agenda%', { '%agenda%' : agenda.title } , values.lang );

            values.resolved = true;

            resolve( values );

          });

        }

      } );

    });

  }

}


function _genUrl( uri, query ) {

  return router.makeGenUrl({
    root: config.root,
    base: { path: '' }
  })( uri, query , { abs: true, protocol: 'https' });

}


function _attemptLoadUser( values ) {

  var userQuery = {};

  if ( values.user ) return w( values );

  if ( values.invitation.userId ) {
   
    userQuery.id = values.invitation.userId;

  } else if ( values.invitation.email ){

    userQuery.email = values.invitation.email;

  }

  return w.promise( function( resolve, reject ) {

    model.users().get( userQuery, function( err, user ) {

      if ( err ) return reject( err );

      values.user = user;

      resolve( values );

    } );

  });

}


function _splitEmails( emails ) {

  if ( typeof emails !== 'string' ) return emails;

  return emails.split(/[\s;,]+/).filter( function( email ) {

    return !!email.trim().length;

  });

}