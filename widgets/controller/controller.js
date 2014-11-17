var debug = require( 'debug' ),

cn = require( '../../js/lib/common/common.mod.js' ),

remote = require( '../../js/lib/remote/remote.mod.js' ),

filters = require( './filters' ),

env = window.env ? window.env : 'prod',

defaults = {
  all: {
    res : '//cibul.net/embed/{uid}/controldata',
    search : '//cibul.net/widgets/{uid}/search'
  },
  dev: {
    res : '//d.cibul.net/frontend_dev.php/embed/{uid}/controldata',
    search : '//d.cibul.net/widgets/{uid}/search'
  },
  tpl: {
    res : '//d.cibul.net/frontend_dev.php/embed/{uid}/controldata',
    search : '//d.cibul.net/widgets/{uid}/search'
  }
},

params = cn.extend( defaults.all, defaults[ env ] ? defaults[ env ] : {} );

module.exports = function( uid ) {

  var log = debug( 'controller ' + uid ),

  ctl = false,   // full agenda data in js form

  ready = false, // is server connection established

  widgets = [], // collection of interfaces to widgets handled by controller

  sendRequest = false,  // callback given by link widget to notify of request params updates

  ctlRequests = [], // stack of callbacks to call when control data is available

  currentRequestParams = {}, // current agenda request parameters

  whatUids = false,

  run = function() {

    log( 'controller loaded in %s environment', env );

    _fetchControllerData( function( err, data ) {

      if ( err || !data ) {

        log( 'problem while fetching data %s', err );

        if ( !data ) {

          log( 'not data could be retrieved' );

        }

        return;

      }

      ready = true;

      log( 'successfully fetched control data' );

      ctl = data;

      _processWidgetCtlRequests();

      _sweep();

    });

    return {
      register: register,
      getWidget: getWidget,
      requestModal: requestModal,
      releaseModal: releaseModal
    }

  },


  /**
   * register a widget - run by widget to establish link with controller
   */

  register = function( options ) {

    var widgetParams = cn.extend( {
      name : false  // required. name of the widget
    }, options );

    widgets.push( widgetParams );

    return {
      update: update,
      getControlData: getControlData,
      requestModal: requestModal,
      releaseModal: releaseModal
    };

  },


  getWidget = function( name ) {

    var widgetParams = false;

    cn.forEach( widgets, function( widget ) {

      if ( widget.name == name ) {

        widgetParams = widget;

      }

    });

    return widgetParams;

  },


  /**
   * hand over control data whhen ready.
   */
  
  getControlData = function( cb ) {

    if ( ctl ) {

      log( 'control data available, handing over' );

      cb( ctl );

    } else {

      log( 'control data not yet available, stacking request' );

      ctlRequests.push( cb );

    }

  },


  /**
   * controller
   * 
   * called by widget when some agenda request parameters were updated
   */
  
  update = function( originWidget, updatedParams ) {

    log( 'updating with %s', JSON.stringify( updatedParams ) );

    var newParams = cn.extend( {}, currentRequestParams, updatedParams );

    if ( !_hasChanges( newParams ) ) return;

    _forEachWidget( 'change', newParams, originWidget );

    _forEachWidget( 'disable', originWidget );

    whatUids = false;

    if ( newParams.what ) {

      var res = params.search.replace( '{uid}', uid );

      remote.getJsonp( res, { data: { search: newParams } }, function( responseType, data ) {

        if ( responseType == 'success' ) {

          whatUids = data;

        }

        _sweep( newParams );

        currentRequestParams = newParams;

      } );

    } else {

      _sweep( newParams );

      currentRequestParams = newParams;

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

    log( 'running %s for all widgets with %s except for %s', methodName, JSON.stringify( methodParams ), except ? except : 'no one' );

    for ( var i = widgets.length - 1; i >= 0; i-- ) {

      if ( widgets[i].name !== except ) widgets[i][ methodName ]( methodParams );
    
    }

  },


  _processWidgetCtlRequests = function( ) {

    var stackedCallback;

    // send control data to whoever requested it during registration process
    while ( stackedCallback = ctlRequests.pop() ) {

      stackedCallback( ctl );

    }

  },


  /**
   * get agenda control data
   */
  
  _fetchControllerData = function( cb ) {

    // what to do if it is not successful?
    
    var res = params.res.replace( '{uid}', uid );
    
    remote.getJsonp( res, {}, function( success, data ) {

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

    var includedCount = 0;

    if ( typeof reqParams == 'undefined' ) reqParams = {};

    if ( !ready ) {

      log( 'controller not ready, sweep aborted' );

      return;

    }

    log( 'doing sweep with params %s', JSON.stringify( reqParams ) );

    // clear all the widgets!
    _forEachWidget( 'clear' );

    // go through each event, determine if should be included
    // .. in which case include in widgets
    for ( var i in ctl.a ) {

      if ( _applyFilters( ctl.a[i], reqParams ) ) {

        includedCount++;

        _include( ctl.a[i] );

      }
    
    }

    log( 'sweep result %d out of %d', includedCount, cn.size( ctl.a ) );

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

      if ( !filters[i]( item, reqParams, whatUids ) ) return false;

    }

    return true;

  },


  /**
   * have there been any changes in parameters?
   */
  
  _hasChanges = function( data ) {

    for ( var i in currentRequestParams ) {

      if ( typeof data[i] == 'undefined' || data[i] !== currentRequestParams[i] ) return true;

    }

    for ( i in data ) {

      if ( typeof currentRequestParams[i] == 'undefined' || data[i] !== currentRequestParams[i] ) return true;

    }

    return false;

  };

  return run();

}