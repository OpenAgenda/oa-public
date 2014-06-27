var cn = require('../../js/lib/common/common.mod.js'),

debug = require('debug'),

log = debug('sandbox'),

params = {
  events: {
    heightChange: 'heightchange'
  },
  parentMethod: 'adjustFrameHeight'
};

window.sandbox = function(eh, options) {

  if (typeof options !== 'undefined') cn.extend(params, options);

  if (typeof window.parent[params.parentMethod] == 'undefined') {

    log('parent method is not defined');

    return;

  }

  log('listening to height change');

  eh.on(params.events.heightChange, updateHeight);

  cn.addEvent(window, 'load', clearHeight);

};

var clearHeight = function() {

  window.parent[params.parentMethod](false);

},

updateHeight = function() {

  var newHeight = cn.el('body').offsetHeight + 20;

  log('sending height to parent: %s', newHeight);

  window.parent[params.parentMethod](newHeight);

};