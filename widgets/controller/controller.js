var debug = require( 'debug' ),

cn = require( '../../js/lib/common/commons.mod.js' ),

remote = require( '../../js/lib/remote/remote.mod.js' ),

filters = require( './filters' ),

env = window.env ? window.env : 'prod',

defaults = {
  all: {
    res : '//cibul.net/embed/{uid}/controldata'
  },
  dev: {
    res : '//d.cibul.net/embed/{uid}/controldata'
  },
  tpl: {
    res : '//d.cibul.net/embed/{uid}/controldata'
  }
},

params = cn.extend( defaults.all, defaults[ env ] ? defaults[ env ] : {} );

model.exports = function( uid ) {

  var log = debug( 'controller ' + uid ),

  ctl = false,   // full agenda data in js form

  ready = false, // is server connection established

  key = false,   // account key

  widgets = [], // collection of interfaces to widgets handled by controller

  sendRequest = false,  // callback given by link widget to notify of request params updates

  ctlRequests = [], // stack of callbacks to call when control data is available

  run = function() {

    log( 'controller loaded in %s environment', env );

    return {
      register: register
    }

  },


  /**
   * register a widget - run by widget to establish link with controller
   */

  register = function( options ) {

    var widgetParams = cn.extend( {
      name : false  // required. name of the widget
    }, options );

     // if there is a key, this is a link
    if ( widgetParams.key ) {

      _registerLink( widgetParams );

      return {
        getControlData: getControlData,
        onResponse: linkReady // link calls this whenever it has an update
      };

    } else {

      return {
        update: update,
        getControlData: getControlData,
        requestModal: requestModal,
        releaseModal: releaseModal
      };

    }

  },


  /**
   * hand over control data whhen ready.
   */
  
  getControlData = function( cb ) {

    if ( ctl ) {

      cb( ctl );

    } else {

      ctlRequests.push( cb );

    }

  },


  /**
   * called by widget when some agenda request parameters were updated
   */
  
  update = function( updatedParams ) {

    var newParams = cn.extend( {}, aParams, updatedParams );

    if ( !_hasChanges( newParams ) ) return;

    _forEachWidget( 'disable' );

    if ( !sendRequest ) {

      log( 'link not established' )

    } else {

      sendRequest( newParams );

    }

  },


  /**
   * disable all widgets except caller
   */
  
  requestModal = function( name, cb ) {

    _forEachWidget( 'disable', name );

    enabled = false;

    cb();

  },


  /**
   * re-enables all widgets
   */
  
  releaseModal = function() {

    _forEachWidget( 'enable' );

    enabled = true;

  },


  /**
   * called by link when changes have been received
   */
  
  linkReady = function( data ) {

    if ( !_hasChanges( data ) || !enabled ) return;

    aParams = data;

    if ( ready ) _sweep( aParams );

  },


  /**
   * run method of each widget at the optional exception of...
   */
  
  _forEachWidget = function(methodName, methodParams, except ) {

    if ( ( arguments.length == 2 ) && ( typeof methodParams == 'string' ) ) {

      except = methodParams;

      methodParams = {}

    } else if ( arguments.length == 2 ) {

      except = false;

    } else if ( arguments.length == 1 ) {

      methodParams = {};

      except = false;

    }

    for ( var i = widgets.length - 1; i >= 0; i-- ) {

      if ( widgets[i].name !== except ) widgets[i][ methodName ]( methodParams );
    
    }

  },


  /**
   * register a data link.
   * a link for the controller serves as the reference for data exchanges.
   * it indicates when requests have been processed by server
   */
  
  _registerLink = function( linkParams ) {

    log( 'registering link widget' );

    ready = false;

    key = options.key;

    sendRequest = linkParams.sendRequest;

    _fetchControllerData( function( err, data ) {

      ready = true;

      ctl = data;

      var stackedCallback;

      // send control data to whoever requested it during registration process
      while ( stackedCallback = ctlRequests.pop() ) {

        stackedCallback( ctl );

      }

      _sweep();

    });

  },


  /**
   * get agenda control data
   */
  
  _fetchControllerData = function( cb ) {

    // what to do if it is not successful?
    
    var res = params.src.replace( '{uid}', uid );
    
    remote.getJsonp( res, { data: { key: key } }, function( success, data ) {

      if ( !success ) {

        log( 'attempt at fetching control data failed: %s', success );

      }

      cb( null, data.data );

    });

  },


  /**
   * uses the control data ( agenda js data ) to determine which
   * events are included and which are not
   */
  
  _sweep = function(reqParams) {

    if ( typeof reqParams == 'undefined' ) reqParams = {};

    // clear all the widgets!
    _forEachWidget( 'clear' );

    // go through each event, determine if should be included
    // .. in which case include in widgets
    for ( var i in ctl.a ) {

      if ( _applyFilters( ctl.a[i], reqParams ) ) _include( ctl.a[i] );
    
    }

    // enable all the widgets!
    _forEachWidget( 'enable', reqParams );

  },


  /**
   * as part of sweep, tell widgets event item passed through filters
   */
  
  _include = function( item ) {

    for ( var i = widgets.length - 1; i >= 0; i-- ) {

      widgets[i].include( item );

    }

  },
  
  _applyFilters = function( item, reqParams ) {

    for ( var i in filters ) {

      if ( !filters[i]( item, reqParams ) ) return false;

    }

    return true;

  }

  return run();

}