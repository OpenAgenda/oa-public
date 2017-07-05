export let onReady;

export default function openRequestForm( event ) {
  if (typeof window !== 'undefined' && window.openRequestForm) {
    window.openRequestForm( event );
  } else {
    onReady = event;
  }
};
