"use strict";

var utils = require( '@openagenda/utils' ),

debug = require( 'debug' ), log,

Spinner = require( 'spin.js' ),

wLib = require(  '../lib/widgetLib' ),

domUtils = require( '../../js/lib/domUtils' ),

styler = require( '../lib/widgetStyler' ),

UID = 0, CONFIG = 1;

import style from './style.css';

if ( [ 'tpl', 'development' ].indexOf( window.env ) !== -1 ) debug.enable( '*' );

function widget( elem, options ) {

  var spinner,

  config = {},

  spinnedAt,

  params = {
    classes: {
      spinning: 'spinning'
    },
    spinnerConfig: {
      width: 2,
      length: 10,
      radius: 20,
      color: '#666'
    },
    minLifetime: 400
  };

  styler( style );

  ( function() {

    var uid = options.anchorConfig[ UID ];

    log = debug( 'spinner widget ' + uid );

    if ( options.anchorConfig.length > 1 ) {

      utils.extend( params.spinnerConfig, JSON.parse( options.anchorConfig[ CONFIG ] ) );

    }

    options.register( wLib.interface( 'spinner', uid, {
      enable: enable,
      disable: disable
    } ) );

    spinner = new Spinner( params.spinnerConfig );

    disable();

  } )();

  function enable() {

    var lifetime = new Date() - spinnedAt;

    if ( lifetime < params.minLifetime ) {

      return setTimeout( function() {

        enable();

      }, params.minLifetime - lifetime );

    }

    spinner.stop();

    domUtils.removeClass( elem, params.classes.spinning );

  }

  function disable() {

    spinnedAt = new Date();

    domUtils.addClass( elem, params.classes.spinning );

    spinner.spin( elem );

  }

}

require( '../lib/loader' )( {
  selector: '.cbpgsp',
  widget: widget
} );
