import MessageItem from './MessageItem';

export default function MessageList({ messages, res, domain }) {
  return messages.map(message => (
    <MessageItem message={message} key={message.id} res={res} domain={domain} />
  ));
}
