"use strict";

const get = require('@openagenda/utils/get');
const debug = require('debug');

let log = () => {};

module.exports = async () => {
  log = debug('envelope');

  log('running envelope');

  if (window && window.location.href.indexOf('/home/inbox') !== -1) {
    return;
  }

  try {
    const { hasNew } = await _get();

    log('fetched has new message', hasNew);

    if (hasNew) {
      log('displaying has new message');

      _displayHasNew();
    }
  } catch (err) {
    log('failed to fetch inbox state', err);
  }
};

function _displayHasNew() {
  const parent = document.querySelector('.js_inbox_header a');

  parent.insertAdjacentHTML('beforeEnd', '<span class="label label-danger "><i class="fa fa-exclamation"></i></span>');
}

function _get() {
  return new Promise((rs, rj) => {
    get(window.env === 'tpl' ? '/server/latest-inbox-timestamp.json' : '/latest-inbox-timestamp', (err, res) => {
      if (err) return rj(err);

      rs(res);
    });
  });
}
