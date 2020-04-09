"use strict";

exports.setOnReady = setOnReady;

var UID = 0, LANG = 1,

wLib = require(  '../lib/widgetLib' ),

template = require( './main.ejs' ),

styler = require( '../lib/widgetStyler' ),

du = require( '../../js/lib/domUtils' ),

config = require( './config' ),

debug = require( 'debug' ),

onReady,

oneWidgetReady = false;

import style from './style.css';

if ( [ 'tpl', 'development' ].indexOf( window.env ) ) debug.enable( '*' );

function widget( elem, options ) {

  var enabled = false,

  log,

  lang = 'fr',

  controller,

  age = null,

  buttonElem, inputElem,

  waiting = false;

  ( function() {

    var uid = options.anchorConfig[ UID ];

    if ( options.anchorConfig[ LANG ] ) {

      lang = options.anchorConfig[ LANG ];

    }

    log = debug( 'age widget ' + uid );

    _createElement();

    controller = options.register( wLib.interface( 'search', uid, {
      enable : enable,
      disable : disable
    } ) );

    oneWidgetReady = true;

    if ( onReady ) onReady();

  } )();


  function enable( reqParams ) {

    enabled = true;

    age = reqParams.age ? reqParams.age : '';

    _refreshElement();

  }

  function disable() {

    enabled = false;

  }


  function _update( value ) {

    age = parseInt( value, 10 );

    if ( isNaN( age ) ) {

      age = null;

    }

    log( 'updating with "%s"', age );

    controller.update( 'age', { age: age } );

  }


  function _createElement() {

    styler( style );

    elem.innerHTML = template( {
      labels: config.labels[ lang ]
    } );

    buttonElem = du.el( elem, 'button' );

    inputElem = du.el( elem, 'input' );

  }

  function _refreshElement() {

    du.removeEvent( inputElem, [ 'keyup', 'blur' ], _onInput );

    if ( buttonElem ) du.removeEvent( buttonElem, 'click', _onClick );

    inputElem.value = age;

    if ( buttonElem ) {

      du.addEvent( buttonElem, 'click', _onClick );

      du.addEvent( inputElem, 'keyup', _onEnter );

    } else {

      du.addEvent( inputElem, [ 'keyup', 'blur' ], _onInput );

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

    if ( age !== newValue ) {

      _update( newValue );

    }

    waiting = false;

  };


  function _onClick( e ) {

    du.preventDefault( e );

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

}

function setOnReady( cb ) {

  if ( oneWidgetReady ) {

    cb();

  }

  onReady = cb;

}

require( '../lib/loader' )( {
  selector: '.cbpgag',
  widget: widget,
  backup: {
    selector: '[data-oaag]',
    classNames: 'cibulSearch'
  }
} );
