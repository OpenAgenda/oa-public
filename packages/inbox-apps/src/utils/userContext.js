export function getFacingUsersIdentifiers(messages, author) {
  return (messages ?? []).map(m => m.inbox).filter(i => i.type === 'user').map(i => i.uid).filter(uid => uid !== author.uid);
}

export function enable(res, messages, author) {
  if (!res.conversations.context) {
    return false;
  }
  return !!getFacingUsersIdentifiers(messages, author);
}
