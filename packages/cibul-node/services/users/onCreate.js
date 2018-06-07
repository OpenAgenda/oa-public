const _ = require( 'lodash' );
const { Inbox } = require( '@openagenda/inboxes' );

module.exports = function onCreate( user ) {

  new Inbox().create( { type: 'user', identifier: user.uid } ).then( _.noop );

};
