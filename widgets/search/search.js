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

onReady;

if ( ['tpl', 'dev'].indexOf( window.env ) !== -1 ) debug.enable( '*' );

var widget = function( elem, options ) {

  var enabled = false,

  lang = 'fr',

  config = cn.extend( {}, baseConfig ),

  controller,

  log,

  what = null,

  inputElem,

  waiting = false, // buffer input to limit server request frequency

  init = function() {

    var uid = options.anchorConfig[ UID ];

    if ( options.anchorConfig[ LANG ] ) {

      lang = options.anchorConfig[ LANG ];

    }

    log = debug( 'search widget ' + uid );

    log( 'initing' );

    controller = options.register( wLib.interface( 'search', uid, {
      enable : enable,
      disable : disable
    } ) );

    _createElement();

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

    controller.update( 'search', { what: what });

  },

  _createElement = function() {

    styler( style );

    elem.innerHTML += new EJS( { text : template } ).render( { labels : config.labels[ lang ] } );

    inputElem = cn.el( elem, 'input' );

  },

  _refreshElement = function() {

    cn.removeEvent( inputElem, [ 'keyup', 'blur' ], _onInput );

    inputElem.value = what;

    cn.addEvent( inputElem, [ 'keyup', 'blur' ], _onInput );

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

  onReady = cb;

}


require( '../lib/controllerLoader' )( function( register ) {

  wLib.forEachAnchor( '.cbpgsc', { register: register }, widget );

} );