"use strict";

var log = require( 'logger' )( 'invitation svc - agenda' ),

lib = require( '../../lib/lib' ),

utils = require( '../../lib/utils' ),

i18n = require( '../../i18n/i18n' ),

config = require( '../../config' ),

mail = require( './mail' ),

notification = require( '../notification/notification' ),

async = require( 'async' ),

w = require( 'when' ),

model = require( '../model' ),

mailer = require( 'mailer' ),

cmn = require( '../../lib/commons-app' ),

genUrl = require( '../genUrl' ),

invitationsService,

TYPES = {
  AGENDACONTRIBUTOR: 1,
  AGENDAADMIN: 2,
  AGENDAMODERATOR: 3
},

inviteMethods = {
  get: {},
  list: {}
};

inviteMethods.get[ TYPES.AGENDACONTRIBUTOR ] = 'getContributorInvite';
inviteMethods.get[ TYPES.AGENDAADMIN ] = 'getAdministratorInvite';
inviteMethods.get[ TYPES.AGENDAMODERATOR ] = 'getModeratorInvite';

inviteMethods.list[ TYPES.AGENDACONTRIBUTOR ] = 'listContributorInvites';
inviteMethods.list[ TYPES.AGENDAADMIN ] = 'listAdministratorInvites';
inviteMethods.list[ TYPES.AGENDAMODERATOR ] = 'listModeratorInvites';

module.exports = agendaInvitations;

agendaInvitations.process = process;

agendaInvitations.init = init;


function init( svc ) {

  invitationsService = svc;

}

function agendaInvitations( agenda ) {

  return {

    /**
     * generate invitations
     */
    inviteContributors: _inviteStakeholders( TYPES.AGENDACONTRIBUTOR ),
    inviteAdministrators: _inviteStakeholders( TYPES.AGENDAADMIN ),
    inviteModerators: _inviteStakeholders( TYPES.AGENDAMODERATOR ),
    inviteContributor: _inviteStakeholder( TYPES.AGENDACONTRIBUTOR ),
    inviteAdministrator: _inviteStakeholder( TYPES.AGENDAADMIN ),
    inviteModerator: _inviteStakeholder( TYPES.AGENDAMODERATOR ),

    /**
     * resend invitations
     */
    resendInviteContributors: _resendInviteStakeholders( TYPES.AGENDACONTRIBUTOR ),
    resendInviteAdministrators: _resendInviteStakeholders( TYPES.AGENDAADMIN ),
    resendInviteModerators: _resendInviteStakeholders( TYPES.AGENDAMODERATOR ),

    /**
     * process invitation: send mail or create stakeholder
     * this sits behind a queue and is handled by a worker process
     */
    processContributorInvitation: _processStakeholder( TYPES.AGENDACONTRIBUTOR ),
    processAdministratorInvitation: _processStakeholder( TYPES.AGENDAADMIN ),
    processModeratorInvitation: _processStakeholder( TYPES.AGENDAMODERATOR )
  }
  

  function _inviteStakeholder( type ) {

    return ( options, cb ) => {

      let params = utils.extend( {
        email: false, // required
        lang: false, // required
        userId: false // optional
      }, options );

      agenda[ inviteMethods.get[ type ] ]( { 
        email: params.email
      }, {
        creatorId: params.userId
      }, ( err, invitation ) => {

        if ( err ) {

          return cb( err );

        }

        if ( invitation ) {

          return invitationsService.addJob( invitation, lang, cb );

        }

        cb( null, null, data );

      });

    }

  }


  function _resendInviteStakeholders( type ) {

    return function( options, cb ) {

      let params = utils.extend( {
        lang: false // required
      }, options ),

      yesterday = new Date();

      yesterday.setDate( yesterday.getDate() - 1 );

      agenda[ inviteMethods.list[ type ] ]( {
        limit: false,
        updatedBefore: yesterday
      }, function( err, invitations ) {

        if ( err ) return cb( err );

        async.eachSeries( invitations, ( invitation, ecb ) => {

          invitationsService.addJob( invitation, params.lang, ecb );

        }, err => {

          if ( err ) return cb( err );

          cb( null, invitations );

        } );

      } );

    }

  }


  function _inviteStakeholders( type ) {

    return ( options, cb ) => {

      var params = utils.extend( {
        emails: false, // required
        lang: false, // required
        userId: false
      }, options ),

      result = {
        errors: []
      },

      invitations = [];

      async.eachSeries( mailer.extractEmails( params.emails, false ), function( email, ecb ) {

        log( 'processing email %s', email );

        agenda[ inviteMethods.get[ type ] ]( { email: email }, { creatorId: params.userId }, function( err, invitation, data ) {

          if ( err ) {

            return ecb( err );

          }
          
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

      }, err => {

        if ( err ) return cb( err );

        async.each( invitations, ( invitation, ecb ) => {

          invitationsService.addJob( invitation, params.lang, ecb );

        }, err => {

          cb( err, invitations, result );  

        });

      } );

    }

  }
  

  /**
   * process stakeholder invitation ( admin, moderator or contributor )
   */

  function _processStakeholder( type ) {

    return function( values ) {

      log( 'processing %s invitation', _equivalent( 'contributor', type )  );

      // if user exists and is activated, process, else send invite.
      
      return _attemptLoadUser( values )

      .then( values => {

        if ( !values.user || !values.user.isActivated ) {

          return _sendInvitation( type, values );

        } else {

          return _createStakeholder( type, values );

        }

      });

    }

  }
  
  function _sendInvitation( type, values ) {

    let d = w.defer(),

    lang, mailIdentifier = null;

    async.waterfall( [

      // get language
      wcb => {

        agenda.getLanguage( ( err, l ) => {

          if ( err ) return wcb( err );

          lang = l;

          wcb();

        } ) 

      },

      // load invitation mail identifier
      wcb => {

        mail.getMailIdentifier( values.invitation, ( err, id ) => {

          if ( err ) return wcb( err );

          mailIdentifier = id;

          wcb();

        } );

      },

      // send mail
      wcb => {

        var link = genUrl( 'agendaSignup', { 
          slug: agenda.slug, 
          iToken: values.invitation.token,
          email: values.invitation.email
        }, { protocol: 'https://' } ),

        title = 'You have been invited to become %stakeholder% of the agenda %agenda%',

        text = 'Click here to start %stakeholderaction% the agenda %agenda%';

        mailer( {
          recipient: values.invitation.email,
          replyTo: mailIdentifier,
          subject: i18n( title, { '%agenda%' : agenda.title, '%stakeholder%' : i18n( _equivalent( 'contributor', type ), lang || 'en' ) }, lang || 'en' ),
          text:  i18n( text, { '%agenda%' : agenda.title, '%stakeholderaction%' : i18n( _equivalent( 'contributing to', type ),  lang || 'en' ) }, lang || 'en' ) + "\n" + link
        }, wcb );

      },

      // update invitation
      wcb => {

        model.invitations().update( { id: values.invitation.id }, { updatedAt: new Date() }, wcb );

      }

    ], err => {

      if ( err ) return d.reject( err );

      d.resolve( values );

    } );

    return d.promise;

  }


  /**
   * create stakeholder
   *
   * @param type                type of the stakeholder to be created
   * @param values.user
   * @param values.lang
   * @param values.invitation   optional invitation
   */

  function _createStakeholder( type, values ) {

    var types = {};

    types[ TYPES.AGENDACONTRIBUTOR ] = {
      label: 'a contributor',
      is: 'isContributor',
      set: 'setContributor',
      new: 'newContributor',
      myNew: 'iAmNewContributor'
    };

    types[ TYPES.AGENDAMODERATOR ] = {
      label: 'a moderator',
      is: 'isModerator',
      set: 'setModerator',
      new: 'newModerator',
      myNew: 'iAmNewModerator'
    };

    types[ TYPES.AGENDAADMIN ] = {
      label: 'an administrator',
      is: 'isAdministrator',
      set: 'setAdministrator',
      new: 'newAdministrator',
      myNew: 'iAmNewAdministrator'
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

          agenda[ t.set ]( values.user, { creatorId: values.invitation.creatorId }, function( err ) {

            if ( err ) return reject( err );

            notification.notify[ t.myNew ]( {
              agendaId: agenda.id,
              userId: values.user.id
            } );

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

  messages[ 'contributing to' ][ TYPES.AGENDACONTRIBUTOR ] = 'contributing to';
  messages[ 'contributing to' ][ TYPES.AGENDAADMIN ] = 'administering';
  messages[ 'contributing to' ][ TYPES.AGENDAMODERATOR ] = 'moderating';

  return messages[ message ][ type ];

}