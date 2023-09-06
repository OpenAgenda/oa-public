function preventUnload(e) {
  e.preventDefault();
  e.returnValue = '';
}

export function unset() {
  if (!window) return;
  window.removeEventListener('beforeunload', preventUnload);
}

export function set() {
  if (!window) return;
  unset(); // in case listener was already loaded
  window.addEventListener('beforeunload', preventUnload);
}
