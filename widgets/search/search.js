"use strict";

exports.setOnReady = setOnReady;

var UID = 0, LANG = 1,

EJS = require( '../../js/lib/clientEjs/ejs' ),

cn = require(  '../../js/lib/common/common.mod.js' ),

wLib = require(  '../lib/widgetLib' ),

debug = require( 'debug' ),

baseConfig = require( './config.js' ),

template = require( './main.ejs' ),

style = require( './style.css' ),

styler = require( '../lib/widgetStyler' ),

today = new Date(),

onReady,

oneWidgetReady = false;

if ( cn.contains( [ 'tpl', 'dev' ], window.env ) ) debug.enable( '*' );

var widget = function( elem, options ) {

  var enabled = false,

  lang = 'fr',

  config = cn.extend( {}, baseConfig ),

  controller,

  log,

  what = null,

  scope = null,

  inputElem, buttonElem,

  waiting = false, // buffer input to limit server request frequency

  init = function() {

    var uid = options.anchorConfig[ UID ];

    if ( wLib.flagged( elem ) ) {

      return;

    }

    if ( options.anchorConfig[ LANG ] ) {

      lang = options.anchorConfig[ LANG ];

    }

    if ( elem.hasAttribute( 'data-scope' ) ) {

      scope = elem.getAttribute( 'data-scope' ).split( '|' )

    }

    log = debug( 'search widget ' + uid );

    log( 'initing' );

    controller = options.register( wLib.interface( 'search', uid, {
      enable : enable,
      disable : disable
    } ) );

    _createElement();

    oneWidgetReady = true;

    if ( onReady ) onReady();

  },

  enable = function( reqParams ) {

    enabled = true;

    what = reqParams.what ? reqParams.what : '';

    _refreshElement();

  },

  disable = function() {

    enabled = false;

  },

  _update = function( value ) {

    what = value.length ? value : null;

    log( 'updating with "%s"', what );

    if ( what ) {

      controller.update( 'search', { what: what, location: null, scope: scope } );

    } else {

      controller.update( 'search', { what: null, scope: null } );

    }

  },

  _createElement = function() {

    styler( style );

    if ( !cn.el( elem, 'input' ) ) {

      elem.innerHTML += new EJS( { text : template } ).render( { labels : config.labels[ lang ] } );
      
    }

    buttonElem = cn.el( elem, 'button' );

    inputElem = cn.el( elem, 'input' );

  },

  _refreshElement = function() {

    cn.removeEvent( inputElem, [ 'keyup', 'blur' ], _onInput );

    if ( buttonElem ) cn.removeEvent( buttonElem, 'click', _onClick );

    inputElem.value = what;

    if ( buttonElem ) {

      cn.addEvent( buttonElem, 'click', _onClick );

      cn.addEvent( inputElem, 'keyup', _onEnter );

    } else {

      cn.addEvent( inputElem, [ 'keyup', 'blur' ], _onInput );

    }

  },

  _onClick = function( e ) {

    cn.preventDefault( e );

    _processInput();

  },

  _onEnter = function( e ) {

     if ( e.keyCode == 13 ) {

      _processInput();

    }

  },

  _onInput = function( e ) {

    if ( waiting ) {

      clearTimeout( waiting );

    }

    if ( e.keyCode == 13 ) {

      _processInput();

    } else {

      waiting = setTimeout( _processInput, config.delay );

    }

  },

  _processInput = function() {

    var newValue = inputElem.value;

    if ( what !== newValue ) {

      _update( newValue );

    }

    waiting = false;

  };

  init();

};

function setOnReady( cb ) {

  if ( oneWidgetReady ) {

    cb();

  }

  onReady = cb;

}


require( '../lib/controllerLoader' )( function( register ) {

  wLib.forEachAnchor( '.cbpgsc', { register: register }, widget );

} );