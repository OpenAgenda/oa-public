var canvasElem = false,
  frameElem = false,
  onClose = false,
  beforeClose = false,
  cn = require('../common/common.mod.js');

module.exports = function(options) {

  options = cn.extend({
    classes: cn.extend({
      canvas: 'lightboxcanvas',
      frame: 'lightboxframe',
      buttonBox: 'lightboxbuttons',
      button: false
    }, options.classes?options.classes:{}),
    onOpen: false
  }, options?options:{});

  var defaultButtons = { ok: { label: 'Ok' } };

  if (typeof options.buttons !== 'undefined') {
    if (options.buttons === false)
      options.buttons = {};
    else
      options.buttons = cn.extend(defaultButtons, options.buttons);
  } else {
    options.buttons = defaultButtons;
  }

  _prepare(options.classes);

  if (options.html)
    _setContent(options.html);
  else if (options.elems)
    _setContent(options.elems);
  else if (options.message)
    _setMessageContent(options.message);

  if (options.buttons) _setButtons(options.classes, options.buttons);

  _display();

  if (options.onOpen) options.onOpen(frameElem);
  onClose = options.onClose?options.onClose:false;
  beforeClose = options.beforeClose?options.beforeClose:false;

  return {
    hide: _hide
  };

};


var _prepare = function(classes) {

  canvasElem?_clear():_create();

  canvasElem.className = classes.canvas;
  frameElem.className = classes.frame;

},

_display = function() {

  canvasElem.style.display = 'block';

  _positionFrame();

},

_create = function() {

  var frontClickFlag = false;

  // create canvas

  canvasElem = document.createElement('div');

  cn.extend(canvasElem.style, {
    position: 'absolute',
    top: cn.getScrollOffsets().y + 'px',
    height: '100%',
    width: '100%',
    display: 'none'
  });

  cn.addEvent(canvasElem, 'click', function() {

    if (frontClickFlag) {
      frontClickFlag = false;
      return;
    }

    _hide();

  });

  cn.addEvent(window, 'scroll', function() {
    canvasElem.style.top = cn.getScrollOffsets().y + 'px';
  });

  // create frame

  frameElem = document.createElement('div');

  cn.addEvent(frameElem, 'click', function() { frontClickFlag = true; });

  cn.extend(frameElem.style, {
    display: 'inline-block',
    position: 'absolute'
  });

  canvasElem.appendChild(frameElem);

  cn.el('body').appendChild(canvasElem);

  cn.addEvent(window, 'resize', _repositionFrame);

},

_clear = function() {

  if (beforeClose) {
    beforeClose(frameElem);
    beforeClose = false;
  }

  while (frameElem.childNodes.length)
    frameElem.removeChild(frameElem.childNodes[0]);

  if (onClose) {
    onClose();
    onClose = false;
  }

},

_hide = function() {

  _clear();

  canvasElem.style.display = 'none';

},

_repositionFrame = function() {

  if (canvasElem.style.display == 'none') return;

  _positionFrame();

},

_positionFrame = function() {

  cn.extend(frameElem.style, {
    display: 'inline-block',
    left: Math.round((canvasElem.offsetWidth - frameElem.offsetWidth)/2) + 'px',
    top: 0,
    maxHeight: 'none',
    overflowY: 'hidden'
  });

  if (frameElem.offsetHeight > cn.windowInnerHeight()) {

    cn.extend(frameElem.style, {
      maxHeight: (cn.windowInnerHeight()-20) + 'px',
      overflowY: 'scroll'
    });

  } else {

    cn.extend(frameElem.style, { top: Math.round((canvasElem.offsetHeight - frameElem.offsetHeight)/2) + 'px' });

  }

},

_setContent = function(content) {

  if (typeof content == 'string') {

    var div = document.createElement('div');

    div.innerHTML = content;

  }

  var elems = div?div.childNodes:content;

  while (elems.length)
    frameElem.appendChild(cn.isArray(elems)?elems.shift():elems[0]);

  cn.forEach(cn.els(frameElem,'img'), function(imgElem) {
    cn.addEvent(imgElem, 'load', _repositionFrame);
  });

  cn.forEach(frameElem.getElementsByTagName('script'), function(scriptElem) {
    eval(scriptElem.innerHTML);
  });

},

_setMessageContent = function(message) {

  var p = document.createElement('p');
  p.innerHTML = message;
  frameElem.appendChild(p);

},

_setButtons = function(classes, buttons) {

  var div = document.createElement('div');
  cn.addClass(div, classes.buttonBox);

  for (var i in buttons) {

    var button = document.createElement('button');
    button.innerHTML = buttons[i].label;

    (function(button, buttonConfig) {

      cn.addEvent(button, 'click', function(){

        if (buttonConfig.onClick) buttonConfig.onClick();

        if (typeof buttonConfig.hide !== 'undefined') if (!buttonConfig.hide) return;

        _hide();

      });

    })(button, buttons[i]);

    if (buttons[i].className) cn.addClass(button, buttons[i].className);

    if (classes.button) cn.addClass(button, classes.button);

    div.appendChild(button);

  }

  frameElem.appendChild(div);

};