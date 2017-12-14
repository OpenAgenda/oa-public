export default function showBackLink( settings, conversations ) {
  const { focusFistConversation, hideEmptyList } = settings;

  if ( focusFistConversation ) {
    if ( hideEmptyList ) {
      if ( conversations && conversations.length && conversations[ 0 ].resolvedAt ) {
        return true; // focusFistConversation && hideEmptyList && conversations not empty
      }
    } else {
      return true; // focusFistConversation && !hideEmptyList
    }
  } else {
    if ( hideEmptyList ) {
      if ( conversations && conversations.length ) {
        return true; // !focusFistConversation && hideEmptyList && conversations not empty
      }
    } else {
      return true; // !focusFistConversation && !hideEmptyList
    }
  }

  return false;
}
