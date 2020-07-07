const log = require('debug')('iframe.parent');
const { iframeResize } = require('iframe-resizer');

const getHash = () => (window.location.hash || '').replace(/^#/, '');

const updateRelativePath = (state, relative) => {
  state.relative = relative;
  window.location.hash = relative;
};

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
    log('received nav from iframe', message);
    updateRelativePath(state, message.nav);
  } else if (message.code === 'internal') {
    log('received internal link click from iframe');
    state.iframe.scrollIntoView();
  } else if (message.link) {
    window.location.href = message.link;
  }
}

function updateIFrameSource({ iframe, base, relative }) {
  iframe.setAttribute('src', base + relative);
}

function updateIframeOnHashChange(state) {
  window.addEventListener(
    'hashchange',
    () => {
      const hash = getHash();
      log('updateIframeOnHashChange - %s vs %s', state.relative, hash);

      if (getHash() === state.relative) {
        return;
      }

      state.relative = getHash();

      updateIFrameSource(state);
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

  const base = iframe.getAttribute(selector);
  let relative = '';

  iframe.setAttribute('style', 'width: 1px; min-width: 100%;');

  if (iframe.getAttribute('data-query')) {
    relative = `?${iframe.getAttribute('data-query')}`;
  } else if (monitorHash) {
    relative = getHash();
  }

  // This iframe parent should track base and

  if (iframe.getAttribute('data-count')) {
    relative = `${relative
      + (relative.indexOf('?') === -1 ? '?' : '&')}limit=${iframe.getAttribute(
      'data-count'
    )}`;
  }

  const state = {
    iframe,
    iFrameReady: false,
    selector,
    base,
    relative
  };

  if (base) {
    updateIFrameSource(state);
  }

  iframeResize(
    {
      log: false,
      onMessage: onMessage.bind(null, state)
    },
    iframe
  );

  if (monitorHash) {
    updateIframeOnHashChange(state);
  }
};
