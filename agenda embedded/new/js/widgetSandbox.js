(function() {

  cibulControllers.onReady(function() {

    var widget = cibulControllers.getWidget();

    if (widget.name == 'map') widget.registerOnBoundsChangeCallback(window.parent.onBoundsChange);

  });

})();