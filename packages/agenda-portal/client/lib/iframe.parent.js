const log = require('debug')('iframe.parent');
const { iframeResize } = require('iframe-resizer');

const getHash = () => window.location.hash.replace(/^#/, '');

function onMessage(state, { message }) {
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

function updateIframeOnHashChange(iframe, base) {
  window.addEventListener(
    'hashchange',
    () => {
      const src = iframe.getAttribute('src').replace(base, '');

      if (src !== getHash()) {
        iframe.setAttribute('src', base + getHash());
      }
    },
    false
  );
}

module.exports = (iframe, options = {}) => {
  const { selector, monitorHash } = {
    selector: 'data-oa-portal',
    monitorHash: false,
    ...options
  };

  log('loading', selector);

  let src = iframe.getAttribute(selector);

  iframe.setAttribute('style', 'width: 1px; min-width: 100%;');

  if (iframe.getAttribute('data-query')) {
    src = `${src}?${iframe.getAttribute('data-query')}`;
  } else if (monitorHash) {
    src += getHash();
  }

  if (iframe.getAttribute('data-count')) {
    src = `${src
      + (src.indexOf('?') === -1 ? '?' : '&')
    }limit=${
      iframe.getAttribute('data-count')}`;
  }

  if (src) {
    iframe.setAttribute('src', src);
  }

  const state = {
    iframe,
    iFrameReady: false,
    selector
  };

  iframeResize(
    {
      log: false,
      onMessage: onMessage.bind(null, state)
    },
    iframe
  );

  if (monitorHash) {
    updateIframeOnHashChange(iframe, iframe.getAttribute(selector));
  }
};
