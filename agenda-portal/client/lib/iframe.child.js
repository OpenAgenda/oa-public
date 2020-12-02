const log = require('debug')('iframe.child');

function _generateUpdatedHref(update) {
  const base = window.location.href.split(window.location.host);
  base.pop();
  const updatedHref = base[0] + window.location.host + update;
  if (updatedHref === window.location.href) {
    return;
  }
  return updatedHref;
}

function onParentMessage(state, onParentNavUpdate, message) {
  if (typeof message !== 'object') return;

  const updatedHref = message.nav ? _generateUpdatedHref(message.nav) : null;

  if (updatedHref && onParentNavUpdate) {
    onParentNavUpdate(updatedHref);
  }
}

function _getCurrentNav() {
  return window.location.href.split(window.location.host).pop();
}

function sendNavUpdate(state) {
  log('sendNavUpdate');
  const { parent } = state;

  if (!parent) {
    return;
  }

  parent.sendMessage({
    code: 'nav',
    nav: _getCurrentNav()
  });
}

function sendExternalLinkClick(state, link) {
  log('sendExternalLinkClick %s', link);
  const { parent } = state;

  if (!parent) {
    return;
  }

  if (link === '#') {
    log('ignoring'); // map zoom out/in buttons have this '#'
    return;
  }

  parent.sendMessage({
    code: 'external',
    link
  });
}

function sendInternalLinkClick(state, link) {
  log('sendInternalLinkClick %s', link);
  const { parent } = state;

  if (!parent) {
    return;
  }

  parent.sendMessage({
    code: 'internal',
    link
  });
}

function sendEventPreviewClick(state, eventSlug) {
  log('sendEventPreviewClick %s', eventSlug);
  const { parent } = state;

  if (!parent) {
    return;
  }

  parent.sendMessage({
    code: 'fromSelection',
    eventSlug
  });
}

module.exports = (options = {}) => {
  const state = {
    parent: null
  };
  const { onParentNavUpdate } = options;

  window.iFrameResizer = {
    onMessage: onParentMessage.bind(null, state, onParentNavUpdate),
    onReady: () => {
      state.parent = window.parentIFrame;
      state.parent.sendMessage({
        code: 'ready',
        nav: _getCurrentNav()
      });
    }
  };

  return {
    sendNavUpdate: sendNavUpdate.bind(null, state),
    sendExternalLinkClick: sendExternalLinkClick.bind(null, state),
    sendInternalLinkClick: sendInternalLinkClick.bind(null, state),
    sendEventPreviewClick: sendEventPreviewClick.bind(null, state)
  };
};
