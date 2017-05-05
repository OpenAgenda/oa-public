"use strict";

const agendas = require( 'agendas' ),

  users = require( 'users' ),

  activities = require( 'activities' ),

  sendStakeholderInvitation = require( './lib/sendStakeholderInvitation' ),

  invitations = require( 'invitations' );

let log = console.log;

function onCreate( stakeholder, context ) {

  agendas.get( { id: stakeholder.agendaId }, { private: null, includeImagePath: true }, ( err, agenda ) => {

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

        sendStakeholderInvitation( invitation, stakeholder, context, agenda );

      } )
      .catch( err => {

        log( 'error', err );

      } );

  } );

}

module.exports.setLog = l => log = l;