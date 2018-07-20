"use strict";

const _ = require( 'lodash' );
const agendas = require( '@openagenda/agendas' );
const users = require( '@openagenda/users' );
const activities = require( '@openagenda/activities' );
const invitations = require( '@openagenda/invitations' );
const agendaStakeholders = require( '@openagenda/agenda-stakeholders' );
const { Inbox } = require( '@openagenda/inboxes' );
const sendStakeholderInvitation = require( './lib/sendStakeholderInvitation' );

const getRole = agendaStakeholders.types.get;

let log = console.log;

module.exports = function ( before, stakeholder, context ) {

  log( 'updated member %s', stakeholder.id );

  agendas.get( { id: stakeholder.agendaId }, { private: null, includeImagePath: true }, async ( err, agenda ) => {

    if ( err ) return log( 'error', err );

    if ( !agenda ) return log( 'info', 'agenda not found: %s', stakeholder.agendaId );

    // Activities
    users.findOne( {
      query: {
        id: stakeholder.userId
      },
      removed: null
    } )
      .then( async user => {

        const senderUser = await users.findOne( {
          query: {
            id: context.invitationSender.userId
          },
          removed: null
        } );

        // new user
        if ( stakeholder.userId && before.userId !== stakeholder.userId ) {

          if ( user.isNew ) {

            await users.setNewFlag( user.uid, false );

          }

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
                    actor: stakeholder.custom.contactName || user.fullName,
                    object: context.invitationSender.name || senderUser.fullName,
                    target: agenda.title
                  },
                  credential: stakeholder.credential
                }
              } )
                .catch( err => {

                  log( 'error', err );

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
                        actor: context.invitationSender.name || senderUser.fullName,
                        object: stakeholder.custom.contactName || user.fullName,
                        target: agenda.title
                      },
                      beforeCredential: before.credential,
                      credential: stakeholder.credential
                    }
                  } )
                    .catch( err => {

                      log( 'error', err );

                    } );

                } );

            } );

          // contributor -> adminmods
          if (
            !agendaStakeholders.types.isSuperiorTo( before.credential, getRole( 'moderator' ), true )
            && agendaStakeholders.types.isSuperiorTo( stakeholder.credential, getRole( 'moderator' ), true )
          ) {

            // add inboxUser
            log( 'add inboxUser (agenda uid %d & user uid %d)', agenda.uid, user.uid );
            new Inbox( { type: 'agenda', identifier: agenda.uid } )
              .users.add( { userUid: user.uid } )
              .then( _.noop );

          }

          // adminmods -> contributor
          if (
            agendaStakeholders.types.isSuperiorTo( before.credential, getRole( 'moderator' ), true )
            && !agendaStakeholders.types.isSuperiorTo( stakeholder.credential, getRole( 'moderator' ), true )
          ) {

            // remove inboxUser
            log( 'remove inboxUser (agenda uid %d & user uid %d)', agenda.uid, user.uid );
            new Inbox( { type: 'agenda', identifier: agenda.uid } )
              .users.remove( { userUid: user.uid } )
              .then( _.noop );

          }

        }

        if ( !before.deletedUser && stakeholder.deletedUser ) {

          log( 'remove inboxUser (agenda uid %d & user uid %d)', agenda.uid, user.uid );
          new Inbox( { type: 'agenda', identifier: agenda.uid } ).users.remove( { userUid: user.uid } ).then( _.noop );

        }

      } )
      .catch( err => {

        log( 'error', err );

      } );


    // Updated invitation
    if (
      !_.isEqual( _.omit( before, 'updatedAt' ), _.omit( stakeholder, 'updatedAt' ) )
      || stakeholder.deletedUser
      || stakeholder.userId
    ) {
      if ( before.custom.email !== stakeholder.custom.email ) {
        const { invitation } = await invitations.get( { email: before.custom.email } );

        if ( invitation ) {
          invitation._data.email = stakeholder.custom.email;

          await invitation.save();
        }

      } else {
        return;
      }
    }

    // New/Resend invitation
    const { invitation } = await invitations.get( { email: stakeholder.custom.email } )

    const action = invitation.data.actions.find( v => v.name === 'linkStakeholder' );
    context = action.params[ 1 ] || context;

    sendStakeholderInvitation( invitation, stakeholder, context, agenda );

  } );

}

module.exports.setLog = l => log = l;
