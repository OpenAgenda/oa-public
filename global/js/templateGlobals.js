// this is used to load global methods in templates
var globalsPath = 'http://templates.cibul.net/global/js/';

loadJs([
  globalsPath + 'handleMobileMonitor.js',
  globalsPath + 'handleMessageLinks.js',
  globalsPath + 'handleGlobals.js'
], function() {
  handleGlobals();
});