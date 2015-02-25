exports.setOnReady = setOnReady;

var UID = 0, VALUES = 1, ACTIVECLASS = 2,

cn = require(  '../../js/lib/common/common.mod.js' ),

wLib = require(  '../lib/widgetLib' ),

debug = require( 'debug' ),

onReady;

if ( ['tpl', 'dev'].indexOf( window.env ) !== -1 ) debug.enable( '*' );


var widget = function( elem, options ) {

  var log,

  controller,

  enabled = false,

  selected = false,

  activeClass,

  values,

  init = function() {

    var uid = options.anchorConfig[ UID ];

    log = debug( 'custom widget ' + uid );

    log( 'initing' );

    try {

      values = JSON.parse( options.anchorConfig[ VALUES ] );  

    } catch( e ) {

      log( 'could not parse values' );

      return;

    }

    activeClass = ( typeof options.anchorConfig[ ACTIVECLASS ] !== 'undefined' ) ?  options.anchorConfig[ ACTIVECLASS ] : 'active';

    controller = options.register( wLib.interface( 'custom', uid, {
      enable: enable,
      disable: disable,
      clear: clear
    } ));

    cn.addEvent( elem, 'click', _onClick );

    if ( onReady ) onReady();

  },

  enable = function( reqParams ) {

    var same = true;

    for ( var v in values ) {

      if ( ( typeof reqParams[v] !== 'undefined' ) && ( reqParams[v] !== values[v] ) ) {

        same = false;

      }

    }

    if ( same ) cn.addClass( elem, activeClass );

    enabled = true;

  },

  disable = function( ) {

    cn.removeClass( elem, activeClass );

  },

  clear = function( ) {

    cn.removeClass( elem, activeClass );

  },

  _onClick = function() {

    if ( !enabled ) {

      log( 'widget is disabled' );

      return;

    }

    controller.update( 'custom', values );

  }

  init();

};

function setOnReady( cb ) {

  onReady = cb;

}

require( '../lib/controllerLoader' )( function( register ) {

  wLib.forEachAnchor( '.cbpgcstm', { register: register }, widget );

} );