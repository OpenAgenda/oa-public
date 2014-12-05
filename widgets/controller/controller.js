var debug = require( 'debug' ),

cn = require( '../../js/lib/common/common.mod.js' ),

remote = require( '../../js/lib/remote/remote.mod.js' ),

filters = require( './filters' ),

env = window.env ? window.env : 'prod',

defaults = {
  all: {
    agenda : '//cibul.net/agendas/{uid}/controldata',
    embed : '//cibul.net/embed/{uid}/controldata',
    search : '//cibul.net/widgets/{uid}/search'
  },
  dev: {
    agenda : '//d.cibul.net/frontend_dev.php/agendas/{uid}/controldata',
    embed : '//d.cibul.net/frontend_dev.php/embed/{uid}/controldata',
    search : '//d.cibul.net/widgets/{uid}/search'
  },
  tpl: {
    agenda : '/server/testdata/controldata-pepite.json',
    embed : '/server/testdata/embedcontroldata-lagargouille.json',
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

  embedMode = ( ( uid + '' ).indexOf('/') !== -1 ), // embedMode is true if widget is for agenda embed

  run = function() {

    log( 'controller loaded in %s environment', env );

    log( 'controller is configured in %s mode', embedMode ? 'embed' : 'agenda' );

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

      sweep();

    });

    return {
      register: register,
      getWidget: getWidget,
      requestModal: requestModal,
      releaseModal: releaseModal,
      update : update,
      sweep : sweep,
      getControlData: getControlData
    }

  },


  /**
   * register a widget - run by widget to establish link with controller
   */

  register = function( options ) {

    var widgetParams = cn.extend( {
      name : false  // required. name of the widget
    }, options );

    log( 'registering widget %s', widgetParams.name );

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

    if ( arguments.length == 1 ) {

      updatedParams = originWidget;

      originWidget = {};

    }

    log( 'updating with %s', JSON.stringify( updatedParams ) );

    var newParams = cn.extend( {}, currentRequestParams, updatedParams );

    if ( !_hasChanges( newParams ) ) return;

    currentRequestParams = _clean( newParams );

    _forEachWidget( 'change', currentRequestParams, originWidget );

    _forEachWidget( 'disable', originWidget );

    whatUids = false;

    if ( currentRequestParams.what ) {

      var res = params.search.replace( '{uid}', uid );

      remote.getJsonp( res, { data: { search: currentRequestParams }, timeout: 10000 }, function( responseType, data ) {

        if ( responseType == 'success' ) {

          whatUids = data;

        }

        sweep();

      } );

    } else {

      sweep();

    }

  },


  /**
   * disable all widgets except caller
   */
  
  requestModal = function( name, cb ) {

    _forEachWidget( 'disable', name );

    enabled = false;

    if ( cb ) cb();

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
  
  _forEachWidget = function( methodName, methodParams, except ) {

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

      if ( widgets[i].name !== except ) {

        if ( widgets[i][ methodName ] ) {

          widgets[i][ methodName ]( methodParams );

        } else {

          log( '%s not set for widget "%s"', methodName, widgets[i].name );

        }

      }
    
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

    var res = ( embedMode ? params.embed : params.agenda ).replace( '{uid}', uid );
    
    remote.get( res, { timeout: 20000 }, function( responseType, data ) {

      if ( responseType !== 'success' ) {

        log( 'attempt at fetching control data failed: %s', responseType );

        return cb( responseType );

      }

      cb( null, data.data );

    }, _isAjax() );

  },

  _isAjax = function() {

    if ( embedMode && ( window.env !== 'tpl' ) ) {

      return false;

    }

    return true;

  }


  /**
   * uses the control data ( agenda js data ) to determine which
   * events are included and which are not
   */
  
  sweep = function() {

    var includedCount = 0;

    if ( typeof currentRequestParams == 'undefined' ) currentRequestParams = {};

    if ( !ready ) {

      log( 'controller not ready, sweep aborted' );

      return;

    }

    log( 'doing sweep with params %s', JSON.stringify( currentRequestParams ) );

    // clear all the widgets!
    _forEachWidget( 'clear' );

    // go through each event, determine if should be included
    // .. in which case include in widgets
    for ( var i in ctl.a ) {

      if ( _applyFilters( ctl.a[i], currentRequestParams ) ) {

        includedCount++;

        ctl.a[i].passed = _isPassed( ctl.a[i] );

        _include( ctl.a[i] );

      }
    
    }

    log( 'sweep result %d out of %d', includedCount, cn.size( ctl.a ) );

    // enable all the widgets!
    _forEachWidget( 'enable', currentRequestParams );

  },


  /**
   * as part of sweep, tell widgets event item passed through filters
   */
  
  _include = function( item ) {

    for ( var i = widgets.length - 1; i >= 0; i-- ) {

      if ( widgets[ i ].include ) {

        widgets[i].include( item );  

      }

    }

  },
  
  _applyFilters = function( item, reqParams ) {

    for ( var i in filters ) {

      if ( !filters[i]( item, reqParams, whatUids ) ) return false;

    }

    return true;

  },

  _clean = function( data ) {

    var cleanData = {};

    for ( var k in data ) {

      if ( data[ k ] !== null ) {

        cleanData[ k ] = data[ k ];

      }

    }

    return cleanData;

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

  },

  _isPassed = function( eItem ) {

    var today = new Date(), l, d,

    today = today.getFullYear() + '-' + _fZ( today.getMonth() + 1 ) + '-' + _fZ( today.getDate() );

    for ( l in eItem.l ) {

      for( d in eItem.l[ l ].d ) {

        if ( eItem.l[ l ].d[ d ] >= today ) return false;

      }

    }

    return true;

  },

  _fZ = function( str ) {

    if ( ( str + '' ).length == 1 ) {

      return '0' + str;

    }

    return str;

  };

  return run();

}