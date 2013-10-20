(function() {

  var canvasElem = false
    , frameElem = false
    , onClose = false

  , lightbox = function(options) {

    options = extend({
      classes: extend({
        canvas: 'lightboxcanvas',
        frame: 'lightboxframe',
        buttonBox: 'lightboxbuttons',
        button: false
      }, options.classes?options.classes:{}),
      onOpen: false
    }, options?options:{});

    var defaultButtons = { ok: { label: 'Ok' } };

    if (typeof options.buttons !== 'undefined') {
      if (options.buttons == false)
        options.buttons = {};
      else
        options.buttons = extend(defaultButtons, options.buttons);
    } else {
      options.buttons = defaultButtons;
    }

    _prepare(options.classes);

    if (options.html)
      _setHTMLContent(options.html);
    else if (options.message)
      _setMessageContent(options.message);

    if (options.buttons) _setButtons(options.classes, options.buttons);

    _display();

    if (options.onOpen) options.onOpen(frameElem);
    onClose = options.onClose?options.onClose:false;

    return {
      hide: _hide
    };

  },

  _prepare = function(classes) {

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

    extend(canvasElem.style, {
      position: 'absolute',
      top: getScrollOffsets().y + 'px',
      height: '100%',
      width: '100%',
      display: 'none'
    });

    addEvent(canvasElem, 'click', function() {

      if (frontClickFlag) {
        frontClickFlag = false;
        return;
      }

      _hide();

    });

    addEvent(window, 'scroll', function() {
      canvasElem.style.top = getScrollOffsets().y + 'px';
    });

    // create frame

    frameElem = document.createElement('div');

    addEvent(frameElem, 'click', function() { frontClickFlag = true; });

    extend(frameElem.style, {
      display: 'inline-block',
      position: 'absolute'
    });

    canvasElem.appendChild(frameElem);

    document.getElementsByTagName('body')[0].appendChild(canvasElem);

    addEvent(window, 'resize', _repositionFrame);

  },

  _clear = function() {

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

    extend(frameElem.style, {top: 0, left: 0});

    _positionFrame();

  },

  _positionFrame = function() {

    frameElem.style.display = 'inline-block';

    extend(frameElem.style, {
      top: Math.round((canvasElem.offsetHeight - frameElem.offsetHeight)/2) + 'px',
      left: Math.round((canvasElem.offsetWidth - frameElem.offsetWidth)/2) + 'px'
    });

  },

  _setHTMLContent = function(html) {

    var div = document.createElement('div');
    div.innerHTML = html;

    forEach(div.childNodes, function(child) {
      frameElem.appendChild(child);
    });

    forEach(frameElem.getElementsByTagName('img'), function(imgElem) {
      addEvent(imgElem, 'load', _repositionFrame);
    });

    forEach(frameElem.getElementsByTagName('script'), function(scriptElem) {
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
    addClass(div, classes.buttonBox);

    for (i in buttons) {

      var button = document.createElement('button');
      button.innerHTML = buttons[i].label;

      (function(button, buttonConfig) {

        addEvent(button, 'click', function(){

          if (buttonConfig.onClick) buttonConfig.onClick();

          if (typeof buttonConfig.hide !== 'undefined') if (!buttonConfig.hide) return;

          _hide();

        });

      })(button, buttons[i]);

      if (buttons[i].className) addClass(button, buttons[i].className);

      if (classes.button) addClass(button, classes.button);

      div.appendChild(button);

    }

    frameElem.appendChild(div);

  };

  window.lightbox = lightbox;

})();