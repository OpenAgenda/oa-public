'use strict';

const invitationSvc = require( '@openagenda/invitations' );
const activitiesSvc = require( '../activities' );


module.exports = function onActivation() {
  return async context => {
    const user = context.result;

    if ( !user ) {
      return context;
    }

    const { invitation } = context.params.optionals || {};

    try {
      await activitiesSvc.feed( {
        entityType: 'user',
        entityUid: user.uid,
      } )
        .create();
    } catch ( err ) {
      if ( err.message !== 'Feed already exists' ) {
        throw err;
      }
    }

    if ( invitation ) {
      await invitationSvc.execute( { token: invitation }, { user } );
    }

    await invitationSvc.execute( { email: user.email }, { user } );
  };
};
