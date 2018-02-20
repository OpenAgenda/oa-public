export let onReady;

export default function openConversationForm( event ) {
  if (typeof window !== 'undefined' && window.openConversationForm) {
    window.openConversationForm( event );
  } else {
    onReady = event;
  }
};
