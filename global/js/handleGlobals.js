var handleGlobals = function() {

  handleMobileMonitor();

  addEvent(window, 'load', function() {

    handleMessageLinks();

  });

};