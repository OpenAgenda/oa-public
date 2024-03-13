import MessageItem from './MessageItem';

export default function MessageList({ messages }) {
  return messages.map(message => (
    <MessageItem message={message} key={message.id} />
  ));
}
