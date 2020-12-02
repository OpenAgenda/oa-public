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
    if (state.iframeScrollOffset) {
      document.querySelector('html').scrollBy(0, -state.iframeScrollOffset);
    }
  } else if (message.code === 'fromSelection') {
    log('received selection slug', message.eventSlug);
    window.location.href = `${(state.target || '#undefined-data-target-url')
      + (state.targetIsIframe ? '#' : '')}/events/${message.eventSlug}`;
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
  const {
    selector,
    monitorHash,
    scrollOffsetSelector,
    targetSelector,
    targetIsIframeSelector
  } = {
    selector: 'data-oa-portal',
    monitorHash: false,
    targetSelector: 'data-target-url',
    scrollOffsetSelector: 'data-scroll-offset',
    targetIsIframeSelector: 'data-target-iframe',
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
    relative,
    target: iframe.hasAttribute(targetSelector)
      ? iframe.getAttribute(targetSelector)
      : null,
    targetIsIframe: iframe.hasAttribute(targetIsIframeSelector),
    iframeScrollOffset: iframe.hasAttribute(scrollOffsetSelector)
      ? parseInt(iframe.getAttribute(scrollOffsetSelector), 10)
      : 0
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
