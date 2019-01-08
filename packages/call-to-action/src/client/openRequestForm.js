export let onReady;

export default function openRequestForm( event ) {
  if ( typeof event.preventDefault === 'function' ) {
    event.preventDefault();
  }

  if (typeof window !== 'undefined' && window.openRequestForm) {
    window.openRequestForm( event );
  } else {
    onReady = event;
  }
};
