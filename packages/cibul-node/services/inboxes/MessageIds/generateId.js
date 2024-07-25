export default function generateId({ conversationId, mailsDomain }, message) {
  return `${Math.ceil(new Date().getTime() / 1000)}.${message.id}.${conversationId}@${mailsDomain}`;
}
