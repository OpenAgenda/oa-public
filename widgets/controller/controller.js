"use strict";

var debug = require( 'debug' ),

cn = require( '../../js/lib/common/common.mod.js' ),

remote = require( '../../js/lib/remote/remote.mod.js' ),

filters = require( './filters' ),

qs = require( 'qs' ),

env = window.env ? window.env : 'prod',

defaults = {
  all: {
    agenda : '//cibul.net/agendas/{uid}/controldata',
    embed : '//cibul.net/agendas/{uid}/embeds/{embedUid}/controldata',
    search : '//cibul.net/widgets/{uid}/search'
  },
  dev: {
    agenda : '//d.cibul.net/agendas/{uid}/controldata',
    embed : '//d.cibul.net/agendas/{uid}/embeds/{embedUid}/controldata',
    search : '//d.cibul.net/widgets/{uid}/search'
  },
  test: {
    agenda : '//d.cibul.net/agendas/{uid}/controldata',
    embed : '//d.cibul.net/agendas/{uid}/embeds/{embedUid}/controldata',
    search : '//d.cibul.net/widgets/{uid}/search'
  },
  tpl: {
    agenda : '/server/testdata/controldata-pepite.json',
    embed : '/server/testdata/' + ( window.testControlData ? window.testControlData : 'embedcontroldata-pepite.json' ),
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

  enabled = false,

  embedMode = ( ( uid + '' ).indexOf('/') !== -1 ), // embedMode is true if widget is for agenda embed

  proxy = false;

  return (function() {

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

      log( 'successfully fetched control data' );

      ctl = data;

      _initCurrentRequestParams();

      _processWidgetCtlRequests( false );

      ready = true;

      // hack to allow some widgets to run getControlData callback once all
      // is declared ready, 
      _processWidgetCtlRequests( true );

      log( 'controller will sync with href ? %s', ctl.sh ? 'yes' : 'no' );

      sweep();
      
    });

    return {
      register: register,
      getWidget: getWidget,
      requestModal: requestModal,
      releaseModal: releaseModal,
      update : update,
      sweep : sweep,
      getControlData: getControlData,
      getCurrentQuery: getCurrentQuery,
      setProxy: setProxy,
    }

  })();


  /**
   * register a widget - run by widget to establish link with controller
   */

  function register( options ) {

    var widgetParams = cn.extend( {
      name : false  // required. name of the widget
    }, options );

    log( 'registering widget %s', widgetParams.name );

    widgets.push( widgetParams );

    return {
      update: update,
      getControlData: getControlData,
      requestModal: requestModal,
      releaseModal: releaseModal,
      getCurrentQuery: getCurrentQuery
    };

  }


  function getWidget( name ) {

    var widgetParams = false;

    cn.forEach( widgets, function( widget ) {

      if ( widget.name == name ) {

        widgetParams = widget;

      }

    });

    return widgetParams;

  }


  /**
   * hand over control data when ready.
   */
  
  function getControlData( postReady, cb ) {

    if ( !cb ) {

      cb = postReady;

      postReady = false;

    }

    if ( ctl ) {

      log( 'control data available, handing over' );

      cb( ctl );

    } else {

      log( 'control data not yet available, stacking request' );

      ctlRequests.push( [ postReady, cb ] );

    }

  }


  function getCurrentQuery() {

    return cn.extend( {}, currentRequestParams );

  }


  function setProxy( p ) {

    proxy = p;

  }


  /**
   * controller
   * 
   * called by widget when some agenda request parameters were updated
   */
  
  function update( originWidget, updatedParams ) {

    if ( arguments.length == 1 ) {

      updatedParams = originWidget;

      originWidget = {};

    }

    log( 'updating with %s', JSON.stringify( updatedParams ) );

    var newParams = cn.extend( {}, currentRequestParams, updatedParams );

    if ( !_hasChanges( newParams ) ) return;

    currentRequestParams = _clean( newParams );

    if ( !ready ) {

      log( 'control data not yet received' );

      return;

    }

    if ( proxy && proxy.update ) proxy.update( updatedParams );

    if ( ctl.sh ) {

      _updateHrefQuery( currentRequestParams );

    }

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

  }


  /**
   * disable all widgets except caller
   */
  
  function requestModal( name, cb ) {

    _forEachWidget( 'disable', name );

    enabled = false;

    if ( cb ) cb();

  }


  /**
   * re-enables all widgets
   */
  
  function releaseModal() {

    _forEachWidget( 'enable' );

    enabled = true;

  }


  function _initCurrentRequestParams() {

    if ( ctl.sh ) {

      currentRequestParams = _readHrefQuery( 'search' );

    }

    if ( !cn.size( currentRequestParams ) && ctl.p ) {

      currentRequestParams.passed = 1;

      if ( ctl.sh ) _updateHrefQuery( currentRequestParams );

    }

  }



  function _hasControlData() {

    return !!ctl;

  }


  /**
   * run method of each widget at the optional exception of...
   */
  
  function _forEachWidget( methodName, methodParams, except ) {

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

  }


  function _processWidgetCtlRequests( postReady ) {

    var toProcess = ctlRequests.length;

    var stackedCallback, restacked = [];

    // send control data to whoever requested it during registration process
    while ( stackedCallback = ctlRequests.pop() ) {

      if ( stackedCallback[ 0 ] === postReady ) {

        stackedCallback[ 1 ]( ctl );

      } else {

        restacked.push( stackedCallback );

      }

    }

    ctlRequests = restacked;

  }


  /**
   * get agenda control data
   */
  
  function _fetchControllerData( cb ) {

    var res;

    if ( embedMode ) {

      uid = uid.split( '/' );

      res = params.embed.replace( '{uid}', uid[ 0 ] ).replace( '{embedUid}', uid[ 1 ] );

    } else {

      res = params.agenda.replace( '{uid}', uid );
    
    }

    remote.get( res, { timeout: 20000 }, function( responseType, data ) {

      if ( responseType !== 'success' ) {

        log( 'attempt at fetching control data failed: %s', responseType );

        return cb( responseType );

      }

      cb( null, data.data );

    }, _isAjax() );

  }


  function _isAjax() {

    if ( embedMode && ( window.env !== 'tpl' ) ) {

      return false;

    }

    return true;

  }


  /**
   * uses the control data ( agenda js data ) to determine which
   * events are included and which are not
   */
  
  function sweep() {

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

  }


  /**
   * as part of sweep, tell widgets event item passed through filters
   */
  
  function _include( item ) {

    for ( var i = widgets.length - 1; i >= 0; i-- ) {

      if ( widgets[ i ].include ) {

        widgets[i].include( item );  

      }

    }

  }

  
  function _applyFilters( item, reqParams ) {

    for ( var i in filters ) {

      if ( !filters[i]( item, reqParams, whatUids ) ) return false;

    }

    return true;

  }


  function _clean( data ) {

    var cleanData = {};

    for ( var k in data ) {

      if ( data[ k ] !== null ) {

        cleanData[ k ] = data[ k ];

      }

    }

    return cleanData;

  }

  /**
   * have there been any changes in parameters?
   */
  
  function _hasChanges( data ) {

    for ( var i in currentRequestParams ) {

      if ( typeof data[i] == 'undefined' || data[i] !== currentRequestParams[i] ) return true;

    }

    for ( i in data ) {

      if ( typeof currentRequestParams[i] == 'undefined' ) return true;

      if ( data[i] !== currentRequestParams[i] ) return true;

    }

    return false;

  }

  function _isPassed( eItem ) {

    var today = new Date(), l, d,

    today = today.getFullYear() + '-' + _fZ( today.getMonth() + 1 ) + '-' + _fZ( today.getDate() );

    for ( l in eItem.l ) {

      for( d in eItem.l[ l ].d ) {

        if ( eItem.l[ l ].d[ d ] >= today ) return false;

      }

    }

    return true;

  }

  function _updateHrefQuery( updatedQuery ) {

    log( 'attempting to update href query' );

    var href = window.location.href, dashPart = false, query = false, queryPart;

    if ( href.split( '#' ).length > 1 ) {

      dashPart = href.split( '#' )[ 0 ];

    }

    href = href.split( '?' )[ 0 ];

    if ( !window.history ) {

      log( 'window.history is not available' );

    } else {

      query = _readHrefQuery();
      
      if ( cn.size( updatedQuery ) ) {

        query.search = updatedQuery;

      } else {

        delete query.search;

      }

      if ( cn.size( query ) ) {

        href = href + '?' + qs.stringify( query );

      }

      if ( dashPart ) {

        href = href + '#' + dashPart;

      }

      window.history.pushState( updatedQuery, null, href );
      
    }

  }

  function _readHrefQuery( key ) {

    var query = {}, queryParts;

    try {

      queryParts = window.location.href.split('#')[0].split( '?' ).slice( 1 );

      if ( queryParts.length ) {

        query = qs.parse( queryParts[ 0 ] );

      }

      return key ? ( query[ key ] ? query[ key ] : {} ) : query;

    } catch( e ) {

      log( 'had some trouble reading href query: %s', e );

    }

    return {};

  }


  function _fZ( str ) {

    if ( ( str + '' ).length == 1 ) {

      return '0' + str;

    }

    return str;

  }

}