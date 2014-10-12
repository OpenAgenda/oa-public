/**
 * handle widget registration to page controllers
 */

if ( window.cibulRegisterWidget ) return;

var debug = require( 'debug' ),

cn = require( '../../js/lib/common/commons.mod.js' ),

controller = require( './controller' ),

log = debug( 'controllers' ),

controllers = {};

window.cibulRegisterWidget = function( options, cb ) {

  var widgetParams = lib.extend( {
    name: false,      // required. name of the widget
    uid: false        // required. the uid of the agenda/embed
  }, options );

 // create controller if not existing

  if ( typeof controllers[ widgetParams.uid ] == 'undefined' ) {

    controllers[ widgetParams.uid ] = controller( widgetParams.uid );

  }

  // register widget with right controller

  controllers[ widgetParams.uid ].register( name, widgetParams );

};