import deselect from 'toggle-selection';

function zeroStyles(input, properties) {
  for (const property in properties) {
    if ({}.hasOwnProperty.call(properties, property)) {
      input.style.setProperty(property, properties[property]);
    }
  }
}

function createInput() {
  const input = document.createElement('input');

  input.setAttribute('size', '0');

  zeroStyles(input, {
    height: '1px',
    width: '1px',
    position: 'fixed',
    bottom: '0',
    right: '0',
    'margin-top': '0',
    'margin-right': '1px',
    'margin-bottom': '1px',
    'margin-left': '0',
    'padding-top': '0',
    'padding-right': '0',
    'padding-bottom': '0',
    'padding-left': '0',
    'box-sizing': 'border',
    'border-width': '0',
    'outline-width': '0',
    'outline-color': 'transparent',
    'min-height': '1px',
    'max-height': '1px',
    'min-width': '1px',
    'max-width': '1px'
  });

  return input;
}

function readSync() {
  const input = createInput();

  document.body.appendChild(input);

  input.focus();

  const success = document.execCommand('paste');

  document.body.removeChild(input);
  // If we don't have permission to read the clipboard,
  // cleanup and throw an error.
  if (!success) {
    throw new Error('NotAllowed');
  }

  return input.value;
}

function isClipboardApiEnabled(navigator) {
  return (
    typeof navigator === 'object' && typeof navigator.clipboard === 'object'
  );
}

export default async function readClipboard() {
  let text = null;
  const reselect = deselect();

  try {
    text = readSync();
  } catch (e) {
    if (isClipboardApiEnabled(navigator)) {
      text = await navigator.clipboard.readText().catch(() => null);
    }
  }

  reselect();

  return text;
}
