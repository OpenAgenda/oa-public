'use strict';

require('@openagenda/polyfills/web');
require('@openagenda/polyfills/dom');
require('@openagenda/polyfills/intl');
require('@openagenda/polyfills/intl-locales');

// import ie8 from 'dom-utils/ie8'; // useful for ie11 too
// import ie9 from 'dom-utils/ie9'; // useful for ie11 too

const layout = require('./layout');

var utils = require('@openagenda/utils'),
  du = require('../../js/lib/domUtils'),
  debug = require('debug'),
  LE = require('./le'),
  Raven = require('raven-js'),
  ran = false, asapRan = false,
  hooks = [], asaps = [],
  params = {};

du.asapReady(function() {
  if (!utils.size(params)) {
    utils.extend(params, layout.getOptions('body'));
  }

  if (params.env == 'development' || window.env == 'development') debug.enable('*');

  du.forEach(asaps, function(asapHook) {
    asapHook(params);
  });

  asapRan = true;
});


du.addEvent(window, 'load', function() {
  if (!utils.size(params)) {
    utils.extend(params, layout.getOptions('body'));
  }

  du.forEach(hooks, function(hook) {
    hook(params);
  });

  if (typeof zE !== 'undefined' && params.lang) {
    zE(function() {
      zE.setLocale(params.lang);
    });
  }

  ran = true;
});


/**
 * provide hook for page specific script launchers
 * which are to be called when page is ready
 */

window.hook = function(cb) {
  if (ran) return cb(params);
  hooks.push(cb);
};


/**
 * same as hook, but ready as soon as options are
 * available
 */

window.asap = function(cb) {
  if (asapRan) return cb(params);
  asaps.push(cb);
};

window.hook(() => {
  if (!window.errorsTrackingConfig) return;

  const errorsTrackingConfig = window.errorsTrackingConfig;

  try {
    LE.init(errorsTrackingConfig.insightOpsKey);
  } catch (e) {}

  try {
    Raven.config(errorsTrackingConfig.sentryDsn, {
      dataCallback(data) {
        try {
          LE.log(data);
        } catch (e) {}
        return data;
      },
    }).install();
  } catch (e) {}
});
