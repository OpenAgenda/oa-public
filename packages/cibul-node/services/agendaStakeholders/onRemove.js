"use strict";

const agendas = require( 'agendas' ),

  users = require( 'users' ),

  activities = require( 'activities' ),

  invitations = require( 'invitations' );

let log = console.log;

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

module.exports.setLog = l => log = l;