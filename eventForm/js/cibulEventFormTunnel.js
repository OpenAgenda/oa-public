var cibulEventFormTunnel = function(params) {

  var VIEWS = {LIST:0, FORM:0},

  params = extend({
    events: {
      heightChange: 'heightchange',
      next: 'next'
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

    sEventHandler.getInstance().on(params.events.next, function(next) {

      tunnel.send({next: next});

    });

  };

  run();

};