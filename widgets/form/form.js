exports.setOnReady = setOnReady;

var UID = 0, LANG = 1, SANDBOX = 2,

cn = require(  '../../js/lib/common/common.mod.js' ),

wLib = require(  '../lib/widgetLib' ),

debug = require( 'debug' ),

tunnelLib = require( '../../js/lib/iTunnel/iTunnel.js' ),

config = require( './config' ),

buttonTemplate = require( './button.ejs' ),

EJS = require( '../../js/lib/clientEjs/ejs' ),

onReady;

if ( window.env == 'tpl' ) debug.enable( '*' );

var widget = function( elem, options ) {

  var log, lang, standalone, listFrame, buttonElem, running, enabled, sandbox,

  controller, uid,

  init = function() {

    uid = options.anchorConfig[ UID ];

    lang = options.anchorConfig[ LANG ];

    sandbox = typeof options.anchorConfig[ SANDBOX ] == 'undefined' ? false : options.anchorConfig[ SANDBOX ];

    log = debug( 'form widget ' + uid );

    log( 'initing' );

    controller = options.register( wLib.interface( 'form', uid, {
      enable : enable,
      disable : disable
    } ) );

    if ( sandbox ) {

      return _initSandbox( sandbox );

    }

    standalone = !cn.els( config.selectors.listFrame ).length;

    if ( standalone ) {

      _initStandalone();

    } else {

      _initIntegrated();

    }

    if ( onReady ) onReady();

  },

  enable = function( reqParams ) {

    enabled = true;

  },

  disable = function() {

    enabled = false;

  },


  _initSandbox = function( sandbox ) {

    if ( !cn.contains( ['form', 'signin', 'signup', 'complete' ], sandbox ) ) {

      log( 'unknown sandbox content type requested %s', sandbox );

      return;

    }

    var frameElem = _initFrame( config.resources.sandbox + '?template=' + sandbox );

    elem.appendChild( frameElem );

  },


  /**
   * standalone form is in its own page,
   * and is displayed as soon as the page loads
   * no add button is required
   */
  
  _initStandalone = function() {

    log( 'standalone mode' );

    var frameElem = _initFrame();

    elem.appendChild( frameElem );

  },

  
  /**
   * integrated mode displays a button 'add an event'
   * when pressed, the form replaces the event list and calls
   * for controller to disable all widgets until procedure is through
   */
  
  _initIntegrated = function() {

    log( 'integrated mode' );

    _create();

    listFrame = cn.el( config.selectors.listFrame );

    buttonElem = cn.el( elem, 'button' );

    // form appears when button is clicked, button the switches to
    // cancel form mode and makes form disappear
    cn.addEvent( buttonElem, 'click', function( e ) {

      if ( !enabled ) return;

      if ( !running ) {

        _swapFrameTo();

        buttonElem.innerHTML = config.labels[ lang ].cancel;

      } else {

        _swapFrameBack();

      }

    });

  },

  /**
   * create button elem
   */

  _create = function() {

    var wrapper = document.createElement( 'div' );

    wrapper.innerHTML = new EJS( { text: buttonTemplate } ).render( { labels: config.labels[ lang ] } );

    elem.appendChild( cn.el( wrapper, 'button' ) );

  },


  /**
   * use the existing frame to display the form
   */
  
  _swapFrameTo = function() {

    controller.requestModal( 'form', function() {

      _initFrame();

      listFrame.insertAdjacentElement( 'beforebegin', frameElem );

      listFrame.parentNode.removeChild( listFrame );

      running = true;

    });

  },

  /**
   * remove the form frame until it is needed again
   */
  
  _swapFrameBack = function() {

    frameElem.insertAdjacentElement( 'beforebegin', listFrame );

    frameElem.parentNode.removeChild( frameElem );

    frameElem = undefined;

    controller.releaseModal();

    running = false;

    buttonElem.innerHTML = config.labels[ lang ].add;

  },

  _initFrame = function( resource ) {

    if ( !resource ) resource = config.resources.form;

    frameElem = document.createElement( 'iframe' );

    frameElem.className = config.classes.form;

    frameElem.setAttribute( 'frameborder', 0 );

    frameElem.setAttribute( 'width', '100%' );

    frameElem.setAttribute( 'allowtransparency', 'allowtransparency' );

    frameElem.src = resource.replace( '{uid}', uid );

    cn.addEvent( frameElem, 'load', function() {

      tunnelLib.iTunnel({
        target: frameElem,
        onReceive: _handleFormMessage 
      });

    });

    return frameElem;

  },

  _handleFormMessage = function( data ) {

    var iframePos;

    if ( data.height ) {

      frameElem.style.height = data.height + 'px';

    }

    if ( data.complete && !standalone ) {

      _swapFrameBack();

    } else if ( data.next ) {

      // not used?

    } else if ( data.clear ) {

      iframePos = _findPos( frameElem )[1];

      if ( _scrollPosition() > iframePos ) {

        _scrollPosition( iframePos - scrollOffset );

      }
      
    }

  },

  _scrollPosition = function( value ) {

    if ( typeof value !== 'undefined' ) scrollTo( 0, value );

    return cn.getScrollOffsets().y;

  },

  _findPos = function( element ) {

    var curleft = 0, curtop = 0;

    if (element.offsetParent) {

      do {
        curleft += element.offsetLeft;
        curtop += element.offsetTop;
      } while (element = element.offsetParent);

    }

    return [curleft, curtop];

  };

  init();

};

function setOnReady( cb ) {

  onReady = cb;

}


require( '../lib/controllerLoader' )( function( register ) {

  wLib.forEachAnchor( '.cbpgbtn', { register: register }, widget );

} );