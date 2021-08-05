export default function showBackLink( settings, conversations ) {
  const { focusFistConversation, hideEmptyList } = settings;

  if (!hideEmptyList) {
    return true;
  }

  if ( focusFistConversation ) {
    if (
      (conversations && conversations.length && conversations[ 0 ].closedAt)
      || (conversations && conversations.length > 1)
    ) {
      return true; // focusFistConversation && conversations not empty
    }
  } else {
    if ( conversations && conversations.length ) {
      return true; // !focusFistConversation && conversations not empty
    }
  }

  return false;
}
