export default function getDestinationInbox( { user, conversation } ) {
  const { inboxes, inboxContextId } = conversation;

  const _inboxes = inboxes
    .sort( o => Number( o.type === 'agenda' ) )
    .filter( v => !(v.type === 'user' && v.identifier === user.uid) );

  return _inboxes.filter( v => v.id !== inboxContextId )[ 0 ] || _inboxes[ 0 ];
}
