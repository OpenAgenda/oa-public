"use strict";

const invitations = require( '@openagenda/invitations' );

const agendaStakeholders = require( '@openagenda/agenda-stakeholders' );

module.exports.init = config => {

  invitations.init( {
    mysql: config.db,
    schemas: config.schemas,
    interfaces: {
      onAssign: ( action, invitation, cb ) => cb( null )
    },
    actions: {
      linkStakeholder: ( executeData, actionParams, cb ) => {

        const { user } = executeData;
        const [ stakeholder, context ] = actionParams;

        agendaStakeholders.agenda( stakeholder.agendaId ).update( {
          id: stakeholder.id
        }, {
          contact_name: user.fullName
        }, {
          allowPartial: true,
          userId: user.id,
          context
        }, err => cb( err ) );

      }
    }
  } );

}
