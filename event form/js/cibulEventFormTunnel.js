var cibulEventFormTunnel = function(params) {

  var params = extend({
    events: {
      heightChange: 'heightchange'
    }
  }, params),

  run = function() {

    var tunnel = iTunnel({
      onReady: function() {

        sEventHandler.getInstance().on(params.events.heightChange, function() {

          tunnel.send({height: el('body').offsetHeight + 20});

        });

        setTimeout(function() {
          tunnel.send({height: el('body').offsetHeight + 20});
        }, 300);

      }
    });

  };

  run();

};