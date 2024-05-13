import MessageItem from './MessageItem';

export default function MessageList({ messages, res, domain }) {
  return messages.map(message => (
    <MessageItem key={message.id} message={message} res={res} domain={domain} />
  ));
}
