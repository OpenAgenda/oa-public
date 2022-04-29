var canvasElem = false,
  frameElem = false,
  onClose = false,
  onHide = false,
  beforeClose = false,
  cn = require('./common');

module.exports = function(options) {

  options = cn.extend({
    classes: cn.extend({
      canvas: 'lightboxcanvas',
      frame: 'lightboxframe',
      buttonBox: 'lightboxbuttons',
      button: false,
      body: 'noscroll'
    }, options.classes?options.classes:{}),
    onOpen: false
  }, options?options:{});

  var defaultButtons = { ok: { label: 'Ok' } },

  exposed = {
    hide: function() {
      _hide( options.classes )
    },
    reposition: _repositionFrame
  };

  if ( typeof options.buttons !== 'undefined' ) {

    if ( options.buttons === false ) {

      options.buttons = {};

    } else {

      options.buttons = cn.extend(defaultButtons, options.buttons);

    }

  } else {

    options.buttons = defaultButtons;

  }

  _prepare( options.classes );

  if ( options.html )
    _setContent( options.html );
  else if ( options.elems )
    _setContent( options.elems );
  else if ( options.message )
    _setMessageContent( options.message );

  if ( options.buttons ) _setButtons( options.classes, options.buttons );

  _display( options.classes );

  if ( options.onOpen ) options.onOpen( frameElem, exposed );

  onClose = options.onClose ? options.onClose : false;

  beforeClose = options.beforeClose ? options.beforeClose : false;

  onHide = options.onHide ? options.onHide : false;

  return exposed;

};


var _prepare = function( classes ) {

  canvasElem ? _clear( classes ) : _create( classes );

  canvasElem.className = classes.canvas;

  frameElem.className = classes.frame;

},

_display = function( classes ) {

  canvasElem.style.display = 'block';

  _positionFrame();

  cn.addClass( cn.el('body'), classes.body );

},

_create = function( classes ) {

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

  cn.addEvent( canvasElem, 'click', function() {

    if ( frontClickFlag ) {
      frontClickFlag = false;
      return;
    }

    _hide( classes );

  });

  cn.addEvent(window, 'scroll', function() {
    canvasElem.style.top = cn.getScrollOffsets().y + 'px';
  });

  // create frame

  frameElem = document.createElement('div');

  cn.addEvent( frameElem, 'click', function() { frontClickFlag = true; });

  cn.extend( frameElem.style, {
    display: 'inline-block',
    position: 'absolute'
  });

  canvasElem.appendChild( frameElem );

  cn.el('body').appendChild( canvasElem );

  cn.addEvent(window, 'resize', _repositionFrame);

},

_clear = function( classes ) {

  if ( beforeClose ) {

    beforeClose( frameElem );
    beforeClose = false;

  }

  while ( frameElem.childNodes.length ) {

    frameElem.removeChild( frameElem.childNodes[0] );

  }

  cn.removeClass( cn.el('body'), classes.body );


  if ( cn.el( 'body' ).style.marginTop !== '0px' ) {

    cn.el( 'body' ).scrollTop = - cn.el( 'body' ).style.marginTop.replace( 'px','' );

    cn.el( 'body' ).style.marginTop = 0;

  }


  if ( onClose ) {

    onClose();
    onClose = false;

  }

},

_hide = function( classes ) {

  _clear( classes );

  canvasElem.style.display = 'none';

  if ( onHide ) onHide();

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

    // adjust body position
    cn.el( 'body' ).style.marginTop = '-' + cn.getScrollOffsets().y + 'px';

    cn.extend(frameElem.style, {
      maxHeight: (cn.windowInnerHeight()-20) + 'px',
      overflowY: 'scroll',
      top: cn.getScrollOffsets().y + 'px'
    });

  } else {

    cn.extend(frameElem.style, { top: Math.round((canvasElem.offsetHeight - frameElem.offsetHeight)/2) + 'px' });

  }

},

_setContent = function(content) {

  if ( typeof content == 'string' ) {

    var div = document.createElement('div');

    div.innerHTML = content;

  }

  var elems = div ? div.childNodes : content;

  while ( elems.length ) {

    frameElem.appendChild(cn.isArray(elems)?elems.shift():elems[0]);

  }

  cn.forEach( cn.els( frameElem,'img' ), function(imgElem) {

    cn.addEvent( imgElem, 'load', _repositionFrame );

  });

  cn.forEach( frameElem.getElementsByTagName('script'), function( scriptElem ) {

    eval( scriptElem.innerHTML );

  });

},

_setMessageContent = function(message) {

  var p = document.createElement('p');
  p.innerHTML = message;
  frameElem.appendChild(p);

},

_setButtons = function(classes, buttons) {

  var div = document.createElement( 'div' );
  cn.addClass( div, classes.buttonBox );

  for ( var i in buttons ) {

    if ( buttons[ i ] ) {

      var button = document.createElement( 'button' );

      button.innerHTML = buttons[i].label;

      (function( button, buttonConfig ) {

        cn.addEvent( button, 'click', function(){

          if ( buttonConfig.onClick ) buttonConfig.onClick();

          if ( typeof buttonConfig.hide !== 'undefined' ) if ( !buttonConfig.hide ) return;

          _hide( classes );

        });

      })(button, buttons[i]);

      if ( buttons[i].className ) cn.addClass( button, buttons[i].className );

      if ( classes.button ) cn.addClass( button, classes.button );

      div.appendChild( button );

    }

  }

  frameElem.appendChild( div );

};
