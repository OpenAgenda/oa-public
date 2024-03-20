import MessageItem from './MessageItem';

export default function MessageList({ messages, res }) {
  return messages.map(message => (
    <MessageItem message={message} key={message.id} res={res} />
  ));
}
