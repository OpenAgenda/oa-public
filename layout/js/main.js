var cn = require('../../js/lib/common/common.mod.js'),

mobileMonitor = require('./handleMobileMonitor.js'),

messageLinks = require('./handleMessageLinks.js'),

loadZopim = require('./zopimLoader.js'),

debug = require('debug'),

log = debug('globals'),

flash = require('./handleFlashMessage.js'),

eh = require('../../js/lib/EventHandler/EventHandler.js').sEventHandler.getInstance(),

ran = false;

module.exports = window.run = function( externalEh, options ) {

  if ( ran ) return;

  ran = true;

  if ( !options ) {

    options = externalEh || {};

  } else {

    if ( externalEh ) eh = externalEh;

  }

  if ( options.env == 'dev' || window.env == 'dev' ) options.enable('*');

  mobileMonitor( document, window, navigator, eh );

  cn.addEvent(window, 'load', function() {

    messageLinks( eh );

    loadZopim( document, window, eh, { env: window.env } );

    flash();

  });

};