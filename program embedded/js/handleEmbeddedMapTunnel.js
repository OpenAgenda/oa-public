var handleEmbeddedMapTunnel = function(options) {

  options = extend({
    events: {
      loadSuccess: 'loadsuccess',
      locationSelectCancel: 'locationselectcancel',
      markerSelect: 'markerselect',
      onBoundsChange: 'onboundschange'
    }
  }, options?options:{});

  var selection = false
    , tunnelReady = false
    , eh = sEventHandler.getInstance()

    , init = function() {

      var tunnel = iTunnel({
        onReady: function() {

          eh.trigger(options.events.loadSuccess);

          tunnelReady = true;

          if (selection) tunnel.send(selection);

        },
        onReceive: function(data) {

          if (data.event=='success') eh.trigger(options.events.loadSuccess, data);

          if (!data.location) eh.trigger(options.events.locationSelectCancel);

        }
      });

      eh.on(options.events.markerSelect, function(location) {

        selection = {location: location.id};

        if (tunnelReady) tunnel.send(selection);

      });

      eh.on(options.events.onBoundsChange, function(newBounds) {

        selection = newBounds;

        if (tunnelReady) tunnel.send(newBounds);

      });

    };

  init();

}