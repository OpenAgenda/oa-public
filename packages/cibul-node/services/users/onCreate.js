const _ = require( 'lodash' );
const { Inbox } = require( '@openagenda/inboxes' );
const invitationsSvc = require( '@openagenda/invitations' );


module.exports = function onCreate() {
  return async context => {
    const user = context.result;
    const { optionals } = context.params;

    if ( !user ) {
      return context;
    }

    new Inbox().create( { type: 'user', identifier: user.uid } ).then( _.noop );

    if ( optionals.invitation ) {
      const { invitation } = await invitationsSvc.get( { token: optionals.invitation } );

      if ( invitation.email !== user.email ) {
        invitation.email = user.email;
        await invitation.save();
      }
    }
  };
};
