var handleEventTunnel = function(heightChangeFunc) {

  var tunnel = iTunnel({
    onReady: function() {

      heightChangeFunc(function(height){

        tunnel.send({height: height});

      });

    }
  });

};