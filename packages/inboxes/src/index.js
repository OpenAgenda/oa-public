import util from 'util';
import Inbox from './Inbox';
import InboxUsers from './InboxUsers';
import InboxUser from './InboxUser';
import Conversations from './Conversations';
import Conversation from './Conversation';
import config, { init } from './config';

function InboxFactory( ...args ) {
  if ( !(this instanceof InboxFactory) ) {
    return new InboxFactory( ...args );
  }

  return Inbox.call( this, ...args );
}

util.inherits( InboxFactory, Inbox );

Object.assign( InboxFactory, Inbox, {
  user: Inbox.user,
  config,
  init
} );

export default InboxFactory;

export {
  config,
  init,
  Inbox,
  InboxUsers,
  InboxUser,
  Conversations,
  Conversation
};
