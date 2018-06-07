"use strict";

const _ = require( 'lodash' );
const agendaStakeholders = require( '@openagenda/agenda-stakeholders' );
const agendas = require( '@openagenda/agendas' );
const users = require( '@openagenda/users' );
const activities = require( '@openagenda/activities' );
const invitations = require( '@openagenda/invitations' );
const { Inbox } = require( '@openagenda/inboxes' );
const sendStakeholderInvitation = require( './lib/sendStakeholderInvitation' );

let log = console.log;

module.exports = function ( stakeholder, context ) {

  log( 'processing invitation for member %s', stakeholder.id );

  agendas.get( { id: stakeholder.agendaId }, { private: null, includeImagePath: true }, ( err, agenda ) => {

    if ( err ) return log( 'error', err );

    if ( !agenda ) return log( 'info', 'agenda not found: %s', stakeholder.agendaId );

    // user already exists
    if ( stakeholder.userId ) {

      log( 'member (id %s) is created and associated with user (id %s)', stakeholder.id, stakeholder.userId );

      users.findOne( {
        query: {
          id: stakeholder.userId
        }
      } )
        .then( async user => {

          if ( user.isNew ) {

            await users.setNewFlag( user.uid, false );

          }

          // Create inboxUser, only for moderator or more
          if (
            agendaStakeholders.types.isSuperiorTo(
              stakeholder.credential,
              agendaStakeholders.types.get( 'moderator' ),
              true
            )
          ) {
            log( 'create inboxUser (agenda uid %d & user uid %d)', agenda.uid, user.uid );
            new Inbox( { type: 'agenda', identifier: agenda.uid } ).users.add( { userUid: user.uid } ).then( _.noop );
          }

          activities.feed( { entityType: 'user', entityUid: user.uid } )
            .follow( { entityType: 'agenda', entityUid: agenda.uid }, { credential: stakeholder.credential } )
            .then( async result => {

              const senderUser = await users.findOne( {
                query: {
                  id: context.invitationSender.userId
                }
              } );

              if ( !senderUser ) return log( 'error', 'sender user ( id %s ) not found', context.invitationSender.userId );

              sendStakeholderInvitation( null, stakeholder, context, agenda );

              if ( !result ) return;

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
                    actor: context.invitationSender.name || senderUser.fullName,
                    object: stakeholder.custom.contactName || user.fullName,
                    target: agenda.title
                  },
                  credential: stakeholder.credential
                }
              } )
                .catch( err => {

                  log( 'error', err );

                } );

            } )
            .catch( err => {

              log( 'error', err );

            } );

        } )
        .catch( err => {

          log( 'error', err );

        } );

      return;

    }

    log( 'user does not exist, sending invitation to %s', stakeholder.custom.email );

    // new user
    invitations.assign( { email: stakeholder.custom.email }, 'linkStakeholder', [ stakeholder, context ] )
      .then( ( { invitation } ) => {

        sendStakeholderInvitation( invitation, stakeholder, context, agenda );

      } )
      .catch( err => {

        log( 'error', err );

      } );

  } );

}

module.exports.setLog = l => log = l;