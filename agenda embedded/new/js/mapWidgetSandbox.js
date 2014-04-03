(function() {

  cibulControllers.onReady(function() {

    cibulControllers.getWidget().registerOnBoundsChangeCallback(window.parent.onBoundsChange);

  });

})();