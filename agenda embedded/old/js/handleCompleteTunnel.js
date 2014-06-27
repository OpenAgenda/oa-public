/**
 * Executed in embed only, when event complete screen is shown
 * 
 */
var handleCompleteTunnel = function(params) {

  params = extend({
    selectors: {
      back: '.js_back',
      add: '.js_add'
    },
    listView: 0
  }, typeof params == 'undefined'?{}:params);

  var tunnel = iTunnel({
    onReady: function() {

      addEvent(el(params.selectors.back), 'click', function(e) {

        preventDefault(e);

        tunnel.send({ view: params.listView, complete: true });

      });

      addEvent(el(params.selectors.add), 'click', function(e) {

        preventDefault(e);

        tunnel.send({next: el(params.selectors.add).getAttribute('href')});

      });

    }
  });


};