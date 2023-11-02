const debug = require('debug');
const { iframeResize } = require('iframe-resizer');

const log = debug('iframe.parent');

const defineRelativePart = require('./defineRelativePart');

const { removePreFromRelativePart, appendPreToNav } = defineRelativePart;

function getHash() {
  return (window.location.hash || '').replace(/^#/, '');
}

/**
 * hash to be handled by iframe are paths or queries. They either start with ? or /.
 * Other hashes are regular navigation hashes for the parent of the frame.
 */
function isPortalHash() {
  const hash = getHash();
  if (!hash.length) {
    return false;
  }

  return ['?', '/'].includes(hash.substring(0, 1));
}

function getRelative(iframe, hash) {
  return defineRelativePart(
    {
      query: iframe.getAttribute('data-query'),
      count: iframe.getAttribute('data-count'),
      randomFromSet: iframe.getAttribute('data-random-from-set'),
      lang: iframe.getAttribute('data-lang'),
      pre: iframe.getAttribute('data-pre'),
    },
    hash,
  );
}

function updateRelativePath(state, relative) {
  state.relative = relative;
  window.location.hash = removePreFromRelativePart(relative);
}

function onMessage(state, { message }) {
  log('onMessage', state, message);
  if (message.code === 'ready' && !state.iFrameReady) {
    state.iFrameReady = true;
    if (isPortalHash()) {
      log('  isPortalHash');
      state.iframe.iFrameResizer.sendMessage({
        code: 'nav',
        nav: appendPreToNav(getHash(), state.iframe.getAttribute('data-pre')),
      });
    }
  } else if (message.nav) {
    log('  received nav from iframe', message);
    updateRelativePath(state, message.nav);
  } else if (message.code === 'internal') {
    log('  received internal link click from iframe');
    state.iframe.scrollIntoView();
    if (state.iframeScrollOffset) {
      document.querySelector('html').scrollBy(0, -state.iframeScrollOffset);
    }
  } else if (message.code === 'fromSelection') {
    log('  received selection slug', message.eventSlug);
    window.location.href = `${
      (state.target || '#undefined-data-target-url')
      + (state.targetIsIframe ? '#' : '')
    }/events/${message.eventSlug}`;
  } else if (message.link) {
    window.location.href = message.link;
  }
}

function updateIFrameSource({ iframe, base, relative }) {
  log('updateIFrameSource', { base, relative });
  iframe.setAttribute('src', base + relative);
}

function updateIframeOnHashChange(state) {
  window.addEventListener(
    'hashchange',
    () => {
      const hash = getHash();
      const filteredRelative = removePreFromRelativePart(state.relative);

      log('updateIframeOnHashChange - %s vs %s', filteredRelative, hash);

      if (hash === filteredRelative) {
        return;
      }

      // what is this relative ??? there should be a part of the query that comes from
      // iframe attributes and another from...
      state.relative = getRelative(state.iframe, hash);

      updateIFrameSource(state);
    },
    false,
  );
}

module.exports = (iframe, options = {}) => {
  const {
    selector,
    monitorHash,
    scrollOffsetSelector,
    targetSelector,
    targetIsIframeSelector,
  } = {
    selector: 'data-oa-portal',
    monitorHash: false,
    targetSelector: 'data-target-url',
    scrollOffsetSelector: 'data-scroll-offset',
    targetIsIframeSelector: 'data-target-iframe',
    ...options,
  };

  log('loading', selector);

  const base = iframe.getAttribute(selector);

  iframe.setAttribute('style', 'width: 1px; min-width: 100%;');

  const relative = getRelative(
    iframe,
    monitorHash && isPortalHash() ? getHash() : null,
  );

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
      : 0,
  };

  if (base) {
    updateIFrameSource(state);
  }

  iframeResize(
    {
      log: false,
      onMessage: onMessage.bind(null, state),
    },
    iframe,
  );

  if (monitorHash) {
    updateIframeOnHashChange(state);
  }
};
