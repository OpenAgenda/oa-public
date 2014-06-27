var cn = require('../../js/lib/common/common.mod.js'),

debug = require('debug'),

log = debug('embedded-tunnel'),

tLib = require('../../js/lib/iTunnel/iTunnel.js'),

params = {
  events: {
    formComplete: 'formcomplete',
    contentClear: 'contentclear',
    heightChange: 'heightchange'
  }
};

window.tunnel = function(eh, options) {

  if (typeof options !== 'undefined') cn.extend(params, options);

  var tunnel = iTunnel({
    onReady: function() {

      eh.on(params.events.formComplete, function() {

        log('complete. Doing nothing.');

      });

      eh.on(params.events.contentClear, function() {

        log('sending form clear through tunnel');

        tunnel.send({clear: true, height: cn.el('body').offsetHeight + 20 });

      });

      eh.on(params.events.heightChange, function() {

        var newHeight = cn.el('body').offsetHeight + 20;

        log('sending height change through tunnel %s', newHeight);

        tunnel.send({height: newHeight});

      });

    }
  });

};