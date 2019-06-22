"use strict";

exports.setOnReady = setOnReady;

var UID = 0, LANG = 1,

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

if ( cn.contains( [ 'tpl', 'development' ], window.env ) ) debug.enable( '*' );

var widget = function( elem, options ) {

  var enabled = false,

  lang = 'fr',

  config = cn.extend( {}, baseConfig ),

  controller,

  log,

  what = null,

  scope = null,

  inputElem, buttonElem,

  includePassed = false,

  waiting = false; // buffer input to limit server request frequency

  ( function() {

    var uid = options.anchorConfig[ UID ];

    if ( options.anchorConfig[ LANG ] ) {

      lang = options.anchorConfig[ LANG ];

    }

    if ( elem.hasAttribute( 'data-scope' ) ) {
      scope = elem.getAttribute( 'data-scope' ).split( '|' );
    }

    if ( elem.hasAttribute( 'data-passed' ) ) {
      includePassed = true;
    }

    log = debug( 'search widget ' + uid );

    log( 'initing' );

    _createElement( elem.hasAttribute( config.searchLabelAttribute ) ? { search: elem.getAttribute( config.searchLabelAttribute ) } : config.labels[ lang ] );

    controller = options.register( wLib.interface( 'search', uid, {
      enable : enable,
      disable : disable
    } ) );

    oneWidgetReady = true;

    if ( onReady ) onReady();

  } )();

  function enable( reqParams ) {

    enabled = true;

    what = reqParams.what ? reqParams.what : '';

    _refreshElement();

  }

  function disable() {

    enabled = false;

  }

  function _update( value ) {

    what = value.length ? value : null;

    log( 'updating with "%s"', what );

    const query = what ? { what: what, location: null, scope: scope } : { what: null, scope: null };

    if ( includePassed ) query.passed = 1;

    controller.update( 'search', query );

  }

  function _createElement( labels ) {

    styler( style );

    if ( !cn.el( elem, 'input' ) ) {

      elem.innerHTML += template( { labels : labels } );

    }

    buttonElem = cn.el( elem, 'button' );

    inputElem = cn.el( elem, 'input' );

  }

  function _refreshElement() {

    cn.removeEvent( inputElem, [ 'keyup', 'blur' ], _onInput );

    if ( buttonElem ) cn.removeEvent( buttonElem, 'click', _onClick );

    inputElem.value = what;

    if ( buttonElem ) {

      cn.addEvent( buttonElem, 'click', _onClick );

      cn.addEvent( inputElem, 'keyup', _onEnter );

    } else {

      cn.addEvent( inputElem, [ 'keyup', 'blur' ], _onInput );

    }

  }

  function _onClick( e ) {

    cn.preventDefault( e );

    _processInput();

  }

  function _onEnter( e ) {

     if ( e.keyCode == 13 ) {

      _processInput();

    }

  }

  function _onInput( e ) {

    if ( waiting ) {

      clearTimeout( waiting );

    }

    if ( e.keyCode == 13 ) {

      _processInput();

    } else {

      waiting = setTimeout( _processInput, config.delay );

    }

  }

  function _processInput() {

    var newValue = inputElem.value;

    if ( what !== newValue ) {

      _update( newValue );

    }

    waiting = false;

  };

};

function setOnReady( cb ) {

  if ( oneWidgetReady ) {

    cb();

  }

  onReady = cb;

}


require( '../lib/loader' )( {
  selector: '.cbpgsc',
  widget: widget,
  backup: {
    selector: '[data-oasc]',
    classNames: 'cibulSearch'
  }
} );
