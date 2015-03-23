"use strict";

var log = require( '../../lib/logger' )( 'invitation svc - agenda' ),

lib = require( '../../lib/lib' ),

i18n = require( '../../i18n/i18n' ),

router = require( '../../lib/router' ),

config = require( '../../config' ),

notification = require( '../notification/notification'),

async = require( 'async' ),

w = require( 'when' ),

model = require( 'cibulModel' )( config.db ),

invitationsService,

TYPES = {
  AGENDACONTRIBUTOR: 1,
  AGENDAADMIN: 2
};


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
    processContributorInvitation: _processStakeholder( TYPES.AGENDACONTRIBUTOR ),
    processAdministratorInvitation: _processStakeholder( TYPES.AGENDAADMIN )
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
  
  function _processStakeholder( type ) {

    return function( values ) {

      log( 'processing %s invitation', type == TYPES.AGENDACONTRIBUTOR ? 'contributor' : 'administrator' );

      // if user exists and is activated, process, else send invite.
      
      return _attemptLoadUser( values )

      .then( function( values ) {

        if ( !values.user || !values.user.isActivated ) {

          return _sendInvitation( type, values );

        } else {

          return _createStakeholder( type, values );

        }

      });

    }

  }
  
  function _sendInvitation( type, values ) {

    return w.promise( function( resolve, reject ) {

      agenda.getLanguage( function( err, lang ) {

        if ( values.lang ) lang = values.lang;

        if ( err ) return reject( err );

        var link = _genUrl( 'signin', { iToken: values.invitation.token } ),

        title = 'You have been invited to become %stakeholder% of the agenda %agenda%',

        text = 'Click here to start %stakeholderaction% the agenda %agenda%';

        // owner invitation language sounds good

        invitationsService.getComs().queue( 'mailer', {
          recipient: values.invitation.email,
          subject: i18n( title, { '%agenda%' : agenda.title, '%stakeholder%' : i18n( type == TYPES.AGENDAADMIN ? 'administrator' : 'contributor', lang ? lang : 'en' ) }, lang ? lang : 'en' ),
          text: i18n( text, { '%agenda%' : agenda.title, '%stakeholderaction%' : i18n( type ==TYPES.AGENDAADMIN ? 'administering' : 'contributing to',  lang ? lang : 'en' ) }, lang ? lang : 'en' ) + "\n" + link
        }, function( err ) {

          if ( err ) return reject( err );

          resolve( values );

        } );

      });


    } );

  }

  function _createStakeholder( type, values ) {

    return w.promise( function( resolve, reject ) {

      agenda[ type==TYPES.AGENDAADMIN ? 'isAdministrator' : 'isContributor' ]( values.user, function( err, is ) {
        
        if ( err ) return reject( err );

        if ( is ) {

          values.message = i18n( 'You are already %astakeholder%', { 
            '%astakeholder%' : i18n( type==TYPES.AGENDAADMIN ? 'an administrator' : 'a contributor', values.lang ) 
          }, values.lang );

          values.resolved = true;

          resolve( values );

        } else {

          agenda[ type==TYPES.AGENDAADMIN ? 'setAdministrator' : 'setContributor' ]( values.user, function( err ) {

            if ( err ) return reject( err );

            notification.notify[ type==TYPES.AGENDAADMIN ? 'newAdministrator' : 'newContributor' ]( {
              agendaId: agenda.id,
              ownerId: values.user.id
            } );

            values.message = i18n( 'You are now %astakeholder% of agenda %agenda%', { 
              '%astakeholder%' : i18n( type==TYPES.AGENDAADMIN ? 'an administrator' : 'a contributor', values.lang ),
              '%agenda%' : agenda.title 
            } , values.lang );

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