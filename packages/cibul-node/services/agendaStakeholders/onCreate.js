"use strict";

const agendas = require( 'agendas' ),

  users = require( '@openagenda/users' ),

  activities = require( '@openagenda/activities' ),

  sendStakeholderInvitation = require( './lib/sendStakeholderInvitation' ),

  invitations = require( 'invitations' );

let log = console.log;

module.exports = function ( stakeholder, context ) {

  log( 'processing invitation for member %s', stakeholder.id );

  agendas.get( { id: stakeholder.agendaId }, { private: null, includeImagePath: true }, ( err, agenda ) => {

    if ( err ) return log( 'error', err );

    if ( !agenda ) return log( 'info', 'agenda not found: %s', stakeholder.agendaId );

    // user already exists
    if ( stakeholder.userId ) {

      log( 'member (id %s) is created and associated with user (id %s)', stakeholder.id, stakeholder.userId );

      users.get( stakeholder.userId, ( err, user ) => {

        if ( err ) return log( 'error', err );

        if ( user.is_new ) {

          users.setNewFlag( { id: stakeholder.userId }, false, ( err ) => {

            if ( err ) return log( 'error', err );

          } );

        }

        activities.feed( { entityType: 'user', entityUid: user.uid } )
          .follow( { entityType: 'agenda', entityUid: agenda.uid }, { credential: stakeholder.credential } )
          .then( result => {

            users.get( context.invitationSender.userId, ( err, senderUser ) => {

              if ( err ) return log( 'error', err );

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
                    actor: context.invitationSender.name || senderUser.full_name,
                    object: stakeholder.custom.contactName || user.full_name,
                    target: agenda.title
                  },
                  credential: stakeholder.credential
                }
              } )
                .catch( err => {

                  log( 'error', err );

                } );

            } );

          } )
          .catch( err => {

            log( 'error', err );

          } );

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