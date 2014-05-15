var Spinner = require('spin.js'),

cn = require('../../../lib/common/common.mod.js'),

params = {
  events: {
    lock: 'lockevent',
    unlock: 'unlockevent'
  },
  fullLock: false,
  lockClass: 'lockPane',
  spinnerColor: '#aaa',
  spinnerWidth: 2
},

lockAnchor = false,

locked = false,

elem,

lockElt;

module.exports = function(el, eh, options) {

  elem = el;

  cn.extend(params, options);

  eh.on(params.events.lock, _lock);

  eh.on(params.events.unlock, _unlock);

};


var _lock = function(config) {

  config = cn.extend({
    position: 'top'
  }, config);

  if (locked) return;

  locked = true;

  if (!lockAnchor) {
    if (params.fullLock) {
      lockAnchor = cn.el('html');
    } else {
      lockAnchor = elem.parentNode;
      if (!lockAnchor.style.position.length) lockAnchor.style.position = 'relative';
    }
  }

  lockElt = document.createElement('div');
  lockElt.className = params.lockClass;
  lockElt.style.width = lockAnchor.offsetWidth + 'px';
  lockElt.style.height = lockAnchor.offsetHeight + 'px';
  lockElt.style.left = '-' + parseInt((window.getComputedStyle?window.getComputedStyle(elem):elem.currentStyle)['paddingLeft'], 10) + 'px';

     
  spinner = new Spinner({
    color: params.spinnerColor,
    width: params.spinnerWidth,
  }).spin();
  
  lockElt.appendChild(spinner.el);

  if (elem.offsetHeight>600) {
    spinner.el.style[config.position] = '100px';
    spinner.el.style.position = 'absolute';
  } else {
    spinner.el.style.top = '50%';
  }
  
  lockAnchor.appendChild(lockElt);

},

_unlock = function() {

  if (!locked) return;
  locked = false;

  spinner.stop();
  lockAnchor.removeChild(lockElt);

};