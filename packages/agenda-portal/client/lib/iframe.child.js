'use strict';

module.exports = ({ onParentNavUpdate }) => {
  const state = {
    parent: null
  };

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
    sendNavUpdate: sendNavUpdate.bind(null, state)
  }
}

function resizerIsReady(state, parentIframe) {
  state.parent = parentIframe;
  parentIFrame.sendMessage({
    code: 'ready',
    nav: _getCurrentNav()
  });
}

function onParentMessage(state, onParentNavUpdate, message) {
  if (typeof message !== 'object') return;

  const updatedHref = message.nav ?  _generateUpdatedHref(message.nav) : null;

  if (updatedHref) {
    onParentNavUpdate(updatedHref);
  }
}

function _generateUpdatedHref(update) {
  const base = window.location.href.split(window.location.host);
  base.pop();
  const updatedHref = base[0] + window.location.host + update;
  if (updatedHref === window.location.href) {
    return;
  }
  return updatedHref;
}


function sendNavUpdate(state) {
  const {
    parent
  } = state;

  if (!parent) {
    return;
  }

  parent.sendMessage({
    code: 'nav',
    nav: _getCurrentNav()
  });
}

function _getCurrentNav() {
  return window.location.href.split(window.location.host).pop()
}
