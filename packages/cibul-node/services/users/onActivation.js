'use strict';

const invitationSvc = require( '@openagenda/invitations' );
const activitiesSvc = require( '@openagenda/activities' );


module.exports = async function onActivation( values ) {

  try {
    await activitiesSvc.feed( { entityType: 'user', entityUid: values.user.uid } ).create()
  } catch ( err ) {
    if ( err.message !== 'Feed already exists' ) {
      throw err;
    }
  }

  if ( values.invitation ) {
    await invitationSvc.execute( { token: values.invitation }, { user: values.user } );
  }

  await invitationSvc.execute( { email: values.user.email }, { user: values.user } );

}
