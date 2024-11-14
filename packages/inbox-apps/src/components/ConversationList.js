import ConversationItem from './ConversationItem.js';

export default function ConversationList({ conversations, user, agenda }) {
  return conversations.map((conversation) => (
    <ConversationItem
      conversation={conversation}
      user={user}
      agenda={agenda}
      key={conversation.id}
    />
  ));
}
