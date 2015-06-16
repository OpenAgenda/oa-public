"use strict";

var log = require( '../../lib/logger' )( 'invitation svc - agenda' ),

lib = require( '../../lib/lib' ),

utils = require( '../../lib/utils' ),

i18n = require( '../../i18n/i18n' ),

router = require( '../../lib/router' ), 

config = require( '../../config' ),

notification = require( '../notification/notification' ),

async = require( 'async' ),

w = require( 'when' ),

model = require( '../model' ),

mailer = require( '../mailer' ),

cmn = require( '../../lib/commons-app' ),

genUrl = require( '../genUrl' ),

invitationsService,

TYPES = {
  AGENDACONTRIBUTOR: 1,
  AGENDAADMIN: 2,
  AGENDAMODERATOR: 3
},

inviteMethods = {};

inviteMethods[ TYPES.AGENDACONTRIBUTOR ] = 'getContributorInvite';
inviteMethods[ TYPES.AGENDAADMIN ] = 'getAdministratorInvite';
inviteMethods[ TYPES.AGENDAMODERATOR ] = 'getModeratorInvite';

module.exports = agendaInvitations;

agendaInvitations.process = process;

agendaInvitations.init = init;


function init( svc ) {

  invitationsService = svc;

}

function agendaInvitations( agenda ) {

  return {
    inviteContributors: _inviteStakeholders( TYPES.AGENDACONTRIBUTOR ),
    inviteAdministrators: _inviteStakeholders( TYPES.AGENDAADMIN ),
    inviteModerators: _inviteStakeholders( TYPES.AGENDAMODERATOR ),
    inviteContributor: _inviteStakeholder( TYPES.AGENDACONTRIBUTOR ),
    inviteAdministrator: _inviteStakeholder( TYPES.AGENDAADMIN ),
    inviteModerator: _inviteStakeholder( TYPES.AGENDAMODERATOR ),
    processContributorInvitation: _processStakeholder( TYPES.AGENDACONTRIBUTOR ),
    processAdministratorInvitation: _processStakeholder( TYPES.AGENDAADMIN ),
    processModeratorInvitation: _processStakeholder( TYPES.AGENDAMODERATOR )
  }
  

  function _inviteStakeholder( type ) {

    return function( email, lang, cb ) {

      agenda[ inviteMethods[ type ] ]( { email: email }, true, function( err, invitation ) {

        if ( err ) return cb( err );

        if ( invitation ) {

          invitationsService.addJob( invitation, lang, cb );

        } else {

          cb( null, null, data );

        }

      });

    }

  }


  function _inviteStakeholders( type ) {

    return function( emails, lang, cb ) {

      var result = {
        errors: []
      },

      invitations = [];

      async.eachSeries( mailer.extractEmails( emails, false ), function( email, ecb ) {

        log( 'processing email %s', email );

        agenda[ inviteMethods[ type ] ]( { email: email }, true, function( err, invitation, data ) {

          if ( err ) return ecb( err );
          
          if ( invitation ) {

            invitations.push( invitation );

          } else {

            result.errors.push( {
              email: email, 
              errors: data.errors
            } );

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

  }
  

  /**
   * process stakeholder invitaiton ( admin, moderator or contributor )
   */

  function _processStakeholder( type ) {

    return function( values ) {

      log( 'processing %s invitation', _equivalent( 'contributor', type )  );

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

        var link = genUrl( 'signin', { iToken: values.invitation.token }, { protocol: 'https://' } ),

        title = 'You have been invited to become %stakeholder% of the agenda %agenda%',

        text = 'Click here to start %stakeholderaction% the agenda %agenda%';


        // owner invitation language sounds good

        invitationsService.getComs().queue( 'mailer', {
          recipient: values.invitation.email,
          subject: i18n( title, { '%agenda%' : agenda.title, '%stakeholder%' : i18n( _equivalent( 'contributor', type ), lang ? lang : 'en' ) }, lang ? lang : 'en' ),
          text: i18n( text, { '%agenda%' : agenda.title, '%stakeholderaction%' : i18n( _equivalent( 'contributing to', type ),  lang ? lang : 'en' ) }, lang ? lang : 'en' ) + "\n" + link
        }, function( err ) {

          if ( err ) return reject( err );

          resolve( values );

        } );

      });


    } );

  }


  /**
   * create stakeholder
   *
   * @param type          type of the stakeholder to be created
   * @param values.user
   * @param values.lang
   */

  function _createStakeholder( type, values ) {

    var types = {};

    types[ TYPES.AGENDACONTRIBUTOR ] = {
      label: 'a contributor',
      is: 'isContributor',
      set: 'setContributor',
      new: 'newContributor'
    };

    types[ TYPES.AGENDAMODERATOR ] = {
      label: 'a moderator',
      is: 'isModerator',
      set: 'setModerator',
      new: 'newModerator'
    };

    types[ TYPES.AGENDAADMIN ] = {
      label: 'an administrator',
      is: 'isAdministrator',
      set: 'setAdministrator',
      new: 'newAdministrator'
    };

    return w.promise( function( resolve, reject ) {

      var t = types[ type ];

      agenda[ t.is ]( values.user, function( err, is ) {

        if ( err ) return reject( err );

        if ( is ) {

          values.message = i18n( 'You are already %astakeholder%', { 
            '%astakeholder%' : i18n( t.label, values.lang ) 
          }, values.lang );

          values.resolved = true;

          resolve( values );

        } else {

          agenda[ t.set ]( values.user, function( err ) {

            if ( err ) return reject( err );

            notification.notify[ t.new ]( {
              agendaId: agenda.id,
              ownerId: values.user.id
            } );

            values.message = i18n( 'You are now %astakeholder% of agenda %agenda%', { 
              '%astakeholder%' : i18n( t.label, values.lang ),
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


/**
 * administrator contributor moderator... involve slight variations in labels
 */
function _equivalent( message, type ) {

  var messages = {};

  messages[ 'contributor' ] = {};
  messages[ 'contributing to' ] = {};

  messages[ 'contributor' ][ TYPES.AGENDACONTRIBUTOR ] = 'contributor';
  messages[ 'contributor' ][ TYPES.AGENDAADMIN ] = 'administrator';
  messages[ 'contributor' ][ TYPES.AGENDAMODERATOR ] = 'moderator';

  messages[ 'contributing to' ][ TYPES.AGENDACONTRIBUTOR ] = 'contributor';
  messages[ 'contributing to' ][ TYPES.AGENDAADMIN ] = 'administering';
  messages[ 'contributing to' ][ TYPES.AGENDAMODERATOR ] = 'moderating';

  return messages[ message ][ type ];

}