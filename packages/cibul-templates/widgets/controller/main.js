"user strict";

/**
 * handle widget registration to page controllers
 */

if ( !window.cibul ) {

  var debug = require( 'debug' ),

  cn = require( '../../js/lib/common' ),

  controller = require( './controller' );

  if ( window.env == 'tpl' ) debug.enable( '*' );

  var log = debug( 'controllers' ),

  controllers = {},

  getCallbacks = {};

  window.cibul = {};

  /**
   * called by a widget to register itself to the right controller
   */

  window.cibul.registerWidget = function( options, cb ) {

    var widgetParams = cn.extend( {
      name: false,      // required. name of the widget
      uid: false        // required. the uid of the agenda/embed
    }, options );

    log( 'widget register request received from %s', widgetParams.name );

   // create controller if not existing

    if ( typeof controllers[ widgetParams.uid ] == 'undefined' ) {

      controllers[ widgetParams.uid ] = controller( widgetParams.uid );

    }

    if ( typeof getCallbacks[ widgetParams.name ] !== 'undefined' ) {

      log( 'calling getWidget callback' );

      getCallbacks[ widgetParams.name ]( widgetParams );

    }

    // register widget with right controller

    return controllers[ widgetParams.uid ].register( widgetParams );

  };


  /**
   * called for getting a handle on controller
   */

  window.cibul.getController = function( uid ) {

    if ( !uid ) {

      throw 'agenda uid is missing';

    }

    if ( !controllers[ uid ] ) {

      log( 'getController: controller not existing > creating: %s', uid );

      controllers[ uid ] = controller( uid );

    }

    return controllers[ uid ];

  }

  window.oa = Object.assign(window.oa || {}, window.cibul);



  /**
   * for admin only. get widget to fetch config data
   */

  exports.getWidget = function( name, cb ) {

    log( 'attempting to get widget %s', name );

    if ( !cn.size( controllers ) ) {

      getCallbacks[ name ] = cb;

      return;

    }

    for( var c in controllers ) break;

    return controllers[c].getWidget( name );

  };

}
