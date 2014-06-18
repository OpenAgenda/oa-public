var cn = require('../../js/lib/common/common.mod.js'),

mobileMonitor = require('./handleMobileMonitor.js'),

messageLinks = require('./handleMessageLinks.js'),

flash = require('./handleFlashMessage.js');

require('../../js/lib/EventHandler/EventHandler.js');


window.handleGlobals = function(eh) {

  mobileMonitor(document, window, navigator, eh);

  cn.addEvent(window, 'load', function() {

    messageLinks(eh);

    flash();

  });

};