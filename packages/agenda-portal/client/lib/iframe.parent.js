'use strict';

const iframeResizer = require('iframe-resizer');
const getHash = () => window.location.hash.replace(/^#/, '');

module.exports = iframe => {
  const src = iframe.getAttribute('data-oa-portal');

  iframe.setAttribute('style', 'width: 1px; min-width: 100%;');

  if (src) {
    iframe.setAttribute('src', src + getHash());
  }

  const state = {
    iframe,
    iFrameReady: false
  };

  iFrameResize({
    log: false,
    onMessage: onMessage.bind(null, state)
  }, iframe);
}

function onMessage(state, { iframe, message }) {
  if (message.code === 'ready' && !state.iFrameReady) {
    state.iFrameReady = true;
    if (window.location.hash.length) {
      state.iframe.iFrameResizer.sendMessage({
        code: 'nav',
        nav: getHash()
      });
    }
  } else if (message.nav) {
    window.location.hash = message.nav;
  }
}
