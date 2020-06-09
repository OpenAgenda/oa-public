
const log = require('debug')('iframe.parent');
const { iframeResize } = require('iframe-resizer');

const getHash = () => window.location.hash.replace(/^#/, '');

function onMessage(state, { message }) {
  log('ooooooooooooooo', state, message);
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
  } else if (message.link) {
    window.location.href = message.link;
  }
}

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

  iframeResize(
    {
      log: false,
      onMessage: onMessage.bind(null, state)
    },
    iframe
  );
};
