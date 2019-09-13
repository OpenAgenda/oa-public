"use strict";

const _ = require( 'lodash' );
const agendas = require( '@openagenda/agendas' );
const invitations = require( '@openagenda/invitations' );
const { Inbox } = require( '@openagenda/inboxes' );
const agendaStakeholders = require( '@openagenda/agenda-stakeholders' );
const usersSvc = require( '../users' );
const activities = require( '../activities' );

const controlDataSvc = require( '../legacy' ).controlData;

let log = console.log;

module.exports = function ( stakeholder ) {

  agendas.get( { id: stakeholder.agendaId }, { private: null }, ( err, agenda ) => {

    if ( err ) return log( 'error', err );

    if ( !agenda ) return log( 'info', 'agenda not found: %s', stakeholder.agendaId );

    if ( !stakeholder.userId ) return;

    usersSvc.findOne( {
      query: {
        id: stakeholder.userId
      }
    } )
      .then( user => {

        if ( !user ) return log( 'error', 'user %s not found', stakeholder.userId );

        log( 'unfollowing agenda for user uid %s', user.uid );

        controlDataSvc.memberRemove( { agendaUid: agenda.uid, userUid: user.uid } );

        activities.feed( { entityType: 'user', entityUid: user.uid } )
          .unfollow( { entityType: 'agenda', entityUid: agenda.uid } );

        // Remove inboxUser, only for moderator or more
        if (
          agendaStakeholders.types.isSuperiorTo(
            stakeholder.credential,
            agendaStakeholders.types.get( 'moderator' ),
            true
          )
        ) {
          log( 'remove inboxUser (agenda uid %d & user uid %d)', agenda.uid, user.uid );
          new Inbox( {
            type: 'agenda',
            identifier: agenda.uid
          } ).users.remove( { userUid: user.uid } )
            .then( _.noop );
        }

      } )
      .catch( err => {

        log( 'error', err );

      } );

  } );

  invitations.get( { email: stakeholder.custom.email } )
    .then( ( { invitation } ) => {

      if ( !invitation ) return;

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
