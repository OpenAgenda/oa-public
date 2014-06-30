var cn = require('../../js/lib/common/common.mod.js'),

mobileMonitor = require('./handleMobileMonitor.js'),

messageLinks = require('./handleMessageLinks.js'),

loadZopim = require('./zopimLoader.js'),

debug = require('debug'),

log = debug('globals'),

params = {
  env: 'prod'
};

flash = require('./handleFlashMessage.js');

require('../../js/lib/EventHandler/EventHandler.js');

window.handleGlobals = function(eh, options) {

  if (typeof options !== 'undefined') cn.extend(params, options);

  if (params.env == 'dev') debug.enable('*');

  mobileMonitor(document, window, navigator, eh);

  cn.addEvent(window, 'load', function() {

    messageLinks(eh);

    loadZopim(document, window, eh, {env: params.env});

    flash();

  });

};