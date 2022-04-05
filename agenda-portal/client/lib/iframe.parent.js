const log = require('debug')('iframe.parent');
const { iframeResize } = require('iframe-resizer');

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

function updateRelativePath(state, relative) {
  state.relative = relative;
  window.location.hash = relative;
}

function appendAttributeValueToQuery(iframe, current, key, attrKey) {
  return `${current}${current.includes('?') ? '&' : '?'}${key}=${iframe.getAttribute(attrKey)}`;
}

function onMessage(state, { message }) {
  if (message.code === 'ready' && !state.iFrameReady) {
    state.iFrameReady = true;
    if (isPortalHash()) {
      state.iframe.iFrameResizer.sendMessage({
        code: 'nav',
        nav: getHash(),
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
    window.location.href = `${
      (state.target || '#undefined-data-target-url')
      + (state.targetIsIframe ? '#' : '')
    }/events/${message.eventSlug}`;
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

      if (hash === state.relative) {
        return;
      }

      state.relative = hash;

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
  let relative = '';

  iframe.setAttribute('style', 'width: 1px; min-width: 100%;');

  if (iframe.getAttribute('data-query')) {
    relative = `?${iframe.getAttribute('data-query')}`;
  } else if (monitorHash && isPortalHash()) {
    relative = getHash();
  }

  // This iframe parent should track base and

  if (iframe.getAttribute('data-count') && !iframe.getAttribute('data-random-from-set')) {
    relative = appendAttributeValueToQuery(
      iframe,
      relative,
      'limit',
      'data-count'
    );
  }

  if (iframe.getAttribute('data-count') && iframe.getAttribute('data-random-from-set')) {
    relative = appendAttributeValueToQuery(
      iframe,
      relative,
      'limit',
      'data-random-from-set'
    );
    relative = appendAttributeValueToQuery(
      iframe,
      relative,
      'subsetRandom',
      'data-count'
    );
  }

  if (iframe.getAttribute('data-lang')) {
    log('adding %s lang to relative path', iframe.getAttribute('data-lang'));
    relative = appendAttributeValueToQuery(
      iframe,
      relative,
      'lang',
      'data-lang'
    );
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
    iframe
  );

  if (monitorHash) {
    updateIframeOnHashChange(state);
  }
};
