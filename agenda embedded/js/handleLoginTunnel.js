/**
 * handle coms for embedded login screen
 */

var handleLoginTunnel = function(params) {

  params = extend({
    events: {
      next: 'next'
    },
  }, params);


  var tunnel = iTunnel(); // should be ready on time

  /**
   * handle response from login frame
   */
  window.onComplete = function(response) {

    tunnel.send({next: response.next});

  };

};