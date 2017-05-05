"use strict";

const agendas = require( 'agendas' ),

  users = require( 'users' ),

  activities = require( 'activities' ),

  invitations = require( 'invitations' ),

  sendStakeholderInvitation = require( './lib/sendStakeholderInvitation' ),

  _ = require( 'lodash' );

let log = console.log;

module.exports = function ( before, stakeholder, context ) {

  agendas.get( { id: stakeholder.agendaId }, { private: null, includeImagePath: true }, ( err, agenda ) => {

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

        sendStakeholderInvitation( invitation, stakeholder, context, agenda );

      } );

  } );

}

module.exports.setLog = l => log = l;