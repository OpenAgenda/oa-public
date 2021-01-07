var handleLock = function(elem, events, options) {

  var events = extend({
    lock: 'lockevent',
    unlock: 'unlockevent'
  }, events)
  , options = extend({
    fullLock: false,
    lockClass: 'lockPane',
    spinnerColor: '#aaa',
    spinnerWidth: 2
  }, options)
  , lockAnchor = false
  , locked = false

  , init = function() {

    sEventHandler.getInstance().on(events.lock, _lock);

    sEventHandler.getInstance().on(events.unlock, _unlock);

  }
  , _lock = function(config) {

    config = extend({
      position: 'top'
    }, config);

    if (locked) return;

    locked = true;

    if (!lockAnchor) {
      if (options.fullLock) {
        lockAnchor = document.getElementsByTagName('html')[0];
      } else {
        lockAnchor = elem.parentNode;
        if (!lockAnchor.style.position.length) lockAnchor.style.position = 'relative';
      }
    }

    lockElt = document.createElement('div');
    lockElt.className = options.lockClass;
    lockElt.style.width = lockAnchor.offsetWidth + 'px';
    lockElt.style.height = lockAnchor.offsetHeight + 'px';
    lockElt.style.left = '-' + parseInt((window.getComputedStyle?window.getComputedStyle(elem):elem.currentStyle)['paddingLeft']) + 'px';

       
    spinner = new Spinner({
      color: options.spinnerColor,
      width: options.spinnerWidth,
    }).spin();
    
    lockElt.appendChild(spinner.el);

    if (elem.offsetHeight>600) {
      spinner.el.style[config.position] = '100px';
      spinner.el.style.position = 'absolute';
    } else {
      spinner.el.style.top = '50%';
    }
    
    lockAnchor.appendChild(lockElt);

  }
  , _unlock = function() {

    if (!locked) return;
    locked = false;

    spinner.stop();
    lockAnchor.removeChild(lockElt);

  }
  ;

  init();
};