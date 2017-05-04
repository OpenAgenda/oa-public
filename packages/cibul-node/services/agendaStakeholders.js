"use strict";

const agendaStakeholders = require( 'agenda-stakeholders' );

const makeLabelGetter = require( 'labels' ),

  getMessageLabel = makeLabelGetter( require( 'labels/agenda-stakeholders/message' ) ), 

  getInvitationLabel = makeLabelGetter( require( 'labels/members/invitation' ) ),

  invitations = require( 'invitations' ),

  activities = require( 'activities' ),

  genUrl = require( './genUrl' ),

  agendas = require( 'agendas' ),

  mailer = require( 'mailer' ),

  logger = require( 'logger' ),

  users = require( 'users' ),

  _ = require( 'lodash' );

let log = console.log;


module.exports.init = ( config, cb ) => {

  log = logger( 'stakholders interfaces' );

  agendaStakeholders.init( {
    queue: {
      names: {
        bulk: config.queues.stakeholderCreate,
        message: config.queues.stakeholderMessage
      },
      redis: config.redis,
      threshold: 20
    },
    schemas: config.schemas,
    mysql: config.db,
    logger,
    interfaces: {
      onMessage,
      onCreate,
      onUpdate,
      onRemove,
      beforeTransferEvent,
      getUser( identifiers, cb ) {

        users.get( identifiers, cb );

      },
      getExistingCredentials( agendaId, cb ) {

        agendas.get( { id: agendaId }, { instanciate: true, private: null }, ( err, agenda ) => {

          if ( err ) return cb( err );

          agenda.getRoles( ( err, credentials ) => {

            if ( err ) return cb( err );

            cb( null, credentials.map( c => c.value ) );

          } );

        } );

      },
      getEventCount( agendaId, userId, cb ) {

        model.lib.query( [
          'select count( distinct ra.id ) event_count',
          'from review_article as ra',
          'where ra.review_id = ? and ra.user_id = ?'
        ].join( ' ' ), [ agendaId, userId ], ( err, rows ) => {

          if ( err ) return cb( err );

          if ( !rows.length ) return cb( null, 0 );

          cb( null, parseInt( rows[ 0 ].event_count ) );

        } );

      }
    }
  }, cb );

}


function beforeTransferEvent( eventUid, ownerId, nextOwnerId, cb ) {

  users.get( ownerId, ( err, ownerUser ) => {

    if ( err ) return cb( err );

    users.get( nextOwnerId, ( err, nextOwnerUser ) => {

      if ( err ) return cb( err );

      activities.feed( { entityType: 'user', entityUid: ownerUser.uid } )
        .unfollow( { entityType: 'event', entityUid: eventUid }, err => {

          if ( err ) {

            log( 'error', err );
            return cb( err );

          }

          activities.feed( { entityType: 'user', entityUid: nextOwnerUser.uid } )
            .follow( { entityType: 'event', entityUid: eventUid }, err => {

              if ( err ) {

                log( 'error', err );
                return cb( err );

              }

              cb();

            } );

        } );

    } );

  } );

}


function onRemove( stakeholder ) {

  agendas.get( { id: stakeholder.agendaId }, { private: null }, ( err, agenda ) => {

    if ( err ) return log( 'error', err );

    if ( !agenda ) return log( 'info', 'agenda not found: %s', stakeholder.agendaId );

    users.get( stakeholder.userId, ( err, user ) => {

      if ( err ) return log( 'error', err );

      if ( !user ) return;

      activities.feed( { entityType: 'user', entityUid: user.uid } )
        .unfollow( { entityType: 'agenda', entityUid: agenda.uid } );

    } );

  } );

  invitations.get( { email: stakeholder.custom.email } )
    .then( ( { invitation } ) => {

      const action = invitation.data.actions.find( v => {
        return v.name === 'linkStakeholder' && v.params[ 0 ].id === stakeholder.id;
      } );

      if ( !action ) return;

      if ( invitation.data.actions.length > 1 ) {
        return invitation.removeAction( action.id );
      }

      return invitation.remove();

    } );

}


function onMessage( stakeholder, message, context, cb ) {

  if ( stakeholder.deletedUser ) return cb();

  agendas.get( stakeholder.agendaId, ( err, agenda ) => {

    if ( err ) log( 'error', err );

    if ( stakeholder.userId && stakeholder.custom.email ) {

      // Member
      const lang = context.lang || 'fr';

      _sendMessageEmail(
        agenda,
        genUrl( 'agendaShow', { slug: agenda.slug } ),
        getMessageLabel( 'seeAgenda', lang ),
        stakeholder.custom.email,
        lang,
        cb
      );

    } else if ( stakeholder.userId ) {

      // User without custom.email
      users.get( stakeholder.userId, { detailed: true }, ( err, user ) => {

        if ( err || !user ) return cb();

        const lang = context.lang || 'fr';

        _sendMessageEmail(
          agenda,
          genUrl( 'agendaShow', { slug: agenda.slug } ),
          getMessageLabel( 'seeAgenda', lang ),
          user.email,
          lang,
          cb
        );

      } );

    } else if ( stakeholder.custom.email ) {

      // Invited
      invitations.get( { email: stakeholder.custom.email } )
        .then( ( { invitation } ) => {

          const action = invitation.data.actions.find( v => v.name === 'linkStakeholder' );
          const contextInvitation = action.params[ 1 ] || context;

          const lang = ( contextInvitation && contextInvitation.lang ) || 'fr';

          const signupUrl = genUrl( 'signup', {
            invitation: invitation.token,
            email: stakeholder.custom.email,
            lang
          }, {
            abs: true,
            protocol: 'https://'
          } );

          _sendMessageEmail(
            agenda,
            signupUrl,
            getInvitationLabel( 'emailAction', lang ),
            stakeholder.custom.email,
            lang,
            cb
          );

        } );

    }

  } );

}



function onUpdate( before, stakeholder, context ) {

  agendas.get( { id: stakeholder.agendaId }, { private: null }, ( err, agenda ) => {

    if ( err ) return log( 'error', err );

    if ( !agenda ) return log( 'info', 'agenda not found: %s', stakeholder.agendaId );

    // Activities
    users.get( stakeholder.userId, ( err, user ) => {

      if ( err ) return log( 'error', err );

      users.get( context.invitationSender.userId, ( err, senderUser ) => {

        if ( err ) return log( 'error', err );

        // new user
        if ( stakeholder.userId && before.userId !== stakeholder.userId ) {

          activities.feed( { entityType: 'user', entityUid: user.uid } )
            .follow( { entityType: 'agenda', entityUid: agenda.uid }, { credential: stakeholder.credential } )
            .then( () => {

              activities.feed( { entityType: 'agenda', entityUid: agenda.uid } ).activities.add( {
                actor: 'user:' + user.uid,
                verb: 'agenda.acceptInvitation',
                object: 'user:' + senderUser.uid,
                target: 'agenda:' + agenda.uid,
                store: {
                  labels: {
                    actor: stakeholder.custom.contactName || user.full_name,
                    object: context.invitationSender.name || senderUser.full_name,
                    target: agenda.title
                  },
                  credential: stakeholder.credential
                }
              } );

            } );

        }

        // change credentials
        if ( stakeholder.userId && before.credential !== stakeholder.credential ) {

          activities.feed( { entityType: 'user', entityUid: user.uid } )
            .unfollow( { entityType: 'agenda', entityUid: agenda.uid }, err => {

              if ( err ) return log( 'error', err );

              activities.feed( { entityType: 'user', entityUid: user.uid } )
                .follow( {
                  entityType: 'agenda',
                  entityUid: agenda.uid
                }, { credential: stakeholder.credential }, err => {

                  if ( err ) return log( 'error', err );

                  activities.feed( { entityType: 'agenda', entityUid: agenda.uid } ).activities.add( {
                    actor: 'user:' + senderUser.uid,
                    verb: 'agenda.setMemberRole',
                    object: 'user:' + user.uid,
                    target: 'agenda:' + agenda.uid,
                    store: {
                      labels: {
                        actor: context.invitationSender.name || senderUser.full_name,
                        object: stakeholder.custom.contactName || user.full_name,
                        target: agenda.title
                      },
                      beforeCredential: before.credential,
                      credential: stakeholder.credential
                    }
                  } );

                } );

            } );

        }

      } );

    } );

    // Invitation
    if (
      !_.isEqual( _.omit( before, 'updatedAt' ), _.omit( stakeholder, 'updatedAt' ) )
      || stakeholder.deletedUser
      || stakeholder.userId
    ) {

      return;

    }

    invitations.get( { email: stakeholder.custom.email } )
      .then( ( { invitation } ) => {

        const action = invitation.data.actions.find( v => v.name === 'linkStakeholder' );
        context = action.params[ 1 ] || context;

        _sendStakeholderInvitation( invitation, stakeholder, context, agenda );

      } );

  } );

}


function onCreate( stakeholder, context ) {

  agendas.get( { id: stakeholder.agendaId }, { private: null }, ( err, agenda ) => {

    if ( err ) return log( 'error', err );

    if ( !agenda ) return log( 'info', 'agenda not found: %s', stakeholder.agendaId );

    // user already exists
    if ( stakeholder.userId ) {

      users.get( stakeholder.userId, ( err, user ) => {

        if ( err ) return log( 'error', err );

        users.get( context.invitationSender.userId, ( err, senderUser ) => {

          if ( err ) return log( 'error', err );

          activities.feed( { entityType: 'user', entityUid: user.uid } )
            .follow( { entityType: 'agenda', entityUid: agenda.uid }, { credential: stakeholder.credential } )
            .then( () => {

              activities.feed( {
                entityType: 'agenda',
                entityUid: agenda.uid 
              } ).activities.add( {
                actor: 'user:' + senderUser.uid,
                verb: 'agenda.addMember',
                object: 'user:' + user.uid,
                target: 'agenda:' + agenda.uid,
                store: {
                  labels: {
                    actor: context.invitationSender.name || senderUser.full_name,
                    object: stakeholder.custom.contactName || user.full_name,
                    target: agenda.title
                  },
                  credential: stakeholder.credential
                }
              } );

            } );

        } );

      } );

      return;

    }

    // new user
    invitations.assign( { email: stakeholder.custom.email }, 'linkStakeholder', [ stakeholder, context ] )
      .then( ( { invitation } ) => {

        _sendStakeholderInvitation( invitation, stakeholder, context, agenda );

      } )
      .catch( err => {

        log( 'error', err );

      } );

  } );

}



function _sendMessageEmail( agenda, url, linkLabel, emailAddress, lang, cb ) {

  mailer( {
    recipient: stakeholder.custom.email,
    subject: getMessageLabel( 'newMessage', { agenda: agenda.title }, lang ),
    data: {
      logo: 'https://openagenda.com/images/openagenda.png',
      title: {
        text: getMessageLabel( 'newMessage', { agenda: agenda.title }, lang ),
        link: url
      },
      action: {
        label: linkLabel,
        link: url
      },
      description: message
    }
  }, cb );

}


function _sendStakeholderInvitation( invitation, stakeholder, context, agenda ) {

  users.get( context.invitationSender.userId, ( err, user ) => {

    if ( err ) return log( 'error', err );

    activities.feed( { entityType: 'agenda', entityUid: agenda.uid } ).activities.add( {
      actor: 'user:' + user.uid,
      verb: 'agenda.sendInvitation',
      object: stakeholder.custom.email,
      target: 'agenda:' + agenda.uid,
      store: {
        labels: {
          actor: context.invitationSender.name || user.full_name,
          // object: stakeholder.custom.email,
          target: agenda.title
        },
        credential: stakeholder.credential
      }
    } );

  } );

  let lang = ( context && context.lang ) || 'fr';

  let signupUrl = genUrl( 'signup', {
    invitation: invitation.token,
    email: stakeholder.custom.email,
    lang
  }, {
    abs: true,
    protocol: 'https://'
  } );

  mailer( {
    recipient: stakeholder.custom.email,
    subject: getInvitationLabel( 'emailSubject', lang ),
    data: {
      logo: 'https://openagenda.com/images/openagenda.png',
      title: {
        text: getInvitationLabel( 'emailTitle', { title: agenda.title }, lang ),
        link: signupUrl
      },
      action: {
        label: getInvitationLabel( 'emailAction', lang ),
        link: signupUrl
      },
      description: context.message ? context.message : getInvitationLabel( 'emailDescription', {
        title: agenda.title,
        credential: getInvitationLabel( agendaStakeholders.types.codes.get( stakeholder.credential ), lang )
      }, lang )
    }
  } );

};