"use strict";

var domain = require( '../../domain' );

var loadJs = require( '../../js/lib/loadJs' ),

utils = require( '@openagenda/utils' ),

wLib = require( './widgetLib' ),

defaults = {
  all : {
    controllersPath : '//'+ domain + '/js/embed/cibulControllers.js'
  },
  dev : {
    controllersPath : '//d.openagenda.com/js/embed/cibulControllers.js'
  },
  tpl : {
    controllersPath : '/js/browserified/widgetsControllerMain.js'
  }
},

env = window.env ? window.env : 'production',

params = utils.extend( defaults.all, defaults[ env ] ? defaults[ env ] : {} );


module.exports = function( options ) {

  var loadOptions = utils.extend( {
    widget: false, // required
    selector: false, // base selector
    backup: { // backup selector for drupal
      selector: false,
      classNames: false // class to set on element for drupal
    }
  }, options );

  getRegister( function( register ) {

    wLib.forEachAnchor( loadOptions.selector, {
      register: register,
      backup: loadOptions.backup
    }, loadOptions.widget );

  } );

}


var getRegister = function( cb ) {

  if ( window.cibul ) {

    cb( window.cibul.registerWidget );

  } else {

    loadJs( params.controllersPath, function() {

      cb( window.cibul.registerWidget );

    } );

  }

}
