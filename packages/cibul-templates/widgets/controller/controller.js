"use strict";

const domain = require( '../../domain' );

const debug = require( 'debug' );
const qs = require( 'qs' );

const cn = require( '../../js/lib/common/common.mod.js' );

const remote = require( '../../js/lib/remote/remote.mod.js' );

const filters = require( './filters' );

const geoLib = require( './geolocate' );

const controlDataFetch = require( '../../js/lib/controlDataFetch/controlDataFetch' );

const env = window.env ? window.env : 'production';

const defaults = {
  all: {
    search : '//' + domain + '/widgets/{uid}/search'
  },
  development: {
    search : '//d.openagenda.com/widgets/{uid}/search'
  },
  test: {
    search : '//d.openagenda.com/widgets/{uid}/search'
  },
  tpl: {
    search : '//d.openagenda.com/widgets/{uid}/search'
  }
};

const params = cn.extend( defaults.all, defaults[ env ] ? defaults[ env ] : {} );

module.exports = function( uid ) {

  var log = debug( 'controller ' + uid ),

  ctl = false,   // full agenda data in js form

  ready = false, // is server connection established

  widgets = [], // collection of interfaces to widgets handled by controller

  sendRequest = false,  // callback given by link widget to notify of request params updates

  ctlRequests = [], // stack of callbacks to call when control data is available

  currentRequestParams = {}, // current agenda request parameters

  whatUids = false, what, scope, passed, // those are for the same feature ( aggregated search )

  enabled = false, firstSweepCompleted = false,

  embedMode = ( ( uid + '' ).indexOf('/') !== -1 ), // embedMode is true if widget is for agenda embed

  proxy = false,

  syncHref = false,

  modalTaken = false,

  passedAutoLoad = true;

  return (function() {

    log( 'controller loaded in %s environment', env );

    log( 'controller is configured in %s mode', embedMode ? 'embed' : 'agenda' );

    _redirectLegacySearch();

    controlDataFetch( {
      jsonp: !_isAjax(),
      uid: ( uid + '' ).split( '/' )[ 0 ],
      embedUid: embedMode ? ( uid + '' ).split( '/' )[ 1 ] : false
    }, function( err, data ) {

      if ( err || !data ) {

        log( 'problem while fetching data %s', err );

        if ( !data ) {

          log( 'not data could be retrieved' );

        }

        return;

      }

      log( 'successfully fetched control data' );

      ctl = _initControlData( data );

      syncHref = !!ctl.sh;

      if ( typeof _readHrefQuery().geolocate !== 'undefined' ) {

        geoLib( ctl, _readHrefQuery( 'geolocate' ), function( err, cornerParams ) {

          if ( err ) {

            console.log( '>>>>>> GEOLOCATION ERROR: ', JSON.stringify( err ) );

            _init();

          } else {

            _init( cornerParams );

          }

        } );

      } else {

        _init();

      }
      
    });

    return {
      register,
      getWidget,
      requestModal,
      releaseModal,
      update,
      sweep,
      getControlData,
      getCurrentQuery,
      isDifferent,
      setProxy,
      disableSyncHref,
      disablePassedAutoLoad
    }

  })();


  function _init( initParams ) {

    var change = _initCurrentRequestParams( initParams );

    _processWidgetCtlRequests( false );

    ready = true;

    // hack to allow some widgets to run getControlData callback once all
    // is declared ready, 
    _processWidgetCtlRequests( true );

    log( 'controller will sync with href ? %s', syncHref ? 'yes' : 'no' );

    if ( syncHref ) {

      if ( change ) _forEachWidget( 'change', currentRequestParams );

      cn.addEvent( window, 'popstate', _handlePop );

    }

    _fetchWhatUids( function() {

      sweep();

    });

  }

  function _handlePop() {

    if ( !syncHref ) return;

    update( _readHrefQuery( 'oaq' ) );

  }


  /**
   * register a widget - run by widget to establish link with controller
   */

  function register( options ) {

    var widgetParams = cn.extend( {
      name : false  // required. name of the widget
    }, options );

    log( 'registering widget %s', widgetParams.name );

    widgets.push( widgetParams );

    if ( firstSweepCompleted && widgetParams.include ) {

      setTimeout( function() {

        _trasverseInclude( widgetParams );

        if ( enabled ) {

          widgetParams.enable( currentRequestParams );

        }

      }, 100 );

    } else if ( enabled ) {

      widgetParams.enable( currentRequestParams );

    }

    return {
      update: update,
      getControlData: getControlData,
      requestModal: requestModal,
      releaseModal: releaseModal,
      getCurrentQuery: getCurrentQuery,
      isDifferent: isDifferent,
      onWidgetReady: onWidgetReady
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

  function disableSyncHref() {

    syncHref = false;

  }

  function disablePassedAutoLoad() {

    passedAutoLoad = false;

  }


  function onWidgetReady( origin, data = {} ) {

    if ( window.oa && window.oa.onWidgetReady ) {

      window.oa.onWidgetReady( origin, data );

    }

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

    var newParams = _clean( cn.extend( {}, currentRequestParams, { 
      uid: null,
      event: null
    }, updatedParams ) );

    if ( !isDifferent( newParams ) ) return;

    currentRequestParams = newParams;

    if ( !ready ) {

      log( 'control data not yet received' );

      return;

    }

    if ( proxy && proxy.update ) proxy.update( updatedParams );

    if ( syncHref ) {

      _updateHrefQuery( currentRequestParams );

    }

    _forEachWidget( 'change', currentRequestParams, originWidget );

    _fetchWhatUids( function() {

      sweep( originWidget );

    });

  }


  function _fetchWhatUids( cb ) {

    if ( what === currentRequestParams.what 

    && scope === currentRequestParams.scope

    && passed === currentRequestParams.passed ) return cb();

    whatUids = false;

    what = currentRequestParams.what;

    scope = currentRequestParams.scope,

    passed = currentRequestParams.passed;

    if ( !what ) return cb();

    var searchQuery = { what: what };

    if ( scope ) searchQuery.scope = scope;

    if ( passed ) searchQuery.passed = passed;

    remote.getJsonp( 
      params.search.replace( '{uid}', uid ) +
      '?' + qs.stringify( { oaq: searchQuery } ), {
      data: {}, 
      timeout: 10000 
    }, function( responseType, data ) {

      if ( responseType == 'success' ) {

        whatUids = data;

      }

      cb();

    } );

  }


  /**
   * disable all widgets except caller
   */
  
  function requestModal( name, cb ) {

    modalTaken = true;

    _forEachWidget( 'disable', name );

    enabled = false;

    if ( cb ) cb();

  }


  /**
   * re-enables all widgets
   */
  
  function releaseModal() {

    modalTaken = false;

    _forEachWidget( 'enable', currentRequestParams );

    enabled = true;

  }


  function _initCurrentRequestParams( overridingParams ) {

    var today = new Date(), hrefParams, change = false;

    if ( typeof overridingParams !== 'undefined' ) {

      currentRequestParams = overridingParams;

      if ( syncHref ) _updateHrefQuery( currentRequestParams );

      change = true;

      return change;

    }


    if ( syncHref ) {

      hrefParams = _clean( _readHrefQuery( 'oaq' ) );

      if ( isDifferent( hrefParams ) ) {

        currentRequestParams = hrefParams;

        change = true;

      }

    }

    if ( ctl.lo ) {

      // bit of a transitional hack (2015-03-06) - remove ctl.p in other widgets before anything here
      ctl.p = today > new Date( ctl.lo.end );

    }

    if ( ctl.p && passedAutoLoad && ( typeof currentRequestParams.passed == 'undefined' || typeof currentRequestParams.order == 'undefined' ) && !currentRequestParams.from && !currentRequestParams.to ) {

      change = true;

      currentRequestParams.passed = 1;

      currentRequestParams.order = 'latest';

      if ( syncHref ) {

        _updateHrefQuery( currentRequestParams );

      }

    }

    return change;

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


  function _initControlData( data ) {

    // distribute location data throughout events

    var locations = {},

    today = _stringifyDate();

    cn.forEach( data.l, function( l ) {

      locations[ l.u ] = { lt: l.lt, lg: l.lg };

    });

    data.geolocate = typeof _readHrefQuery().geolocate !== 'undefined';

    cn.forEach( data.ev, function( e ) {

      if ( e.l ) {

        if ( typeof locations[ e.l ] !== 'undefined' ) {

          e.lt = locations[ e.l ].lt;

          e.lg = locations[ e.l ].lg;

        } else {

          console.log( 'invalid location for event' );
          console.log( e );

        }

      }


      // append is passed info

      e.p = true;
      
      for (var i = e.d.length - 1; i >= 0; i--) {

        if ( e.d[ i ] >= today ) {

          e.p = false;

          break;

        }

      };

    });

    locations = undefined;

    return data;

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
  
  function sweep( originWidget ) {

    var includedCount = 0;

    if ( typeof currentRequestParams == 'undefined' ) currentRequestParams = {};

    if ( !ready ) {

      log( 'controller not ready, sweep aborted' );

      return;

    }

    log( 'doing sweep with params %s', JSON.stringify( currentRequestParams ) );

    // clear all the widgets!
    _forEachWidget( 'clear' );

    _forEachWidget( 'disable', originWidget );

    // let clear & disable happen
    setTimeout( function() {

      includedCount = _trasverseInclude();

      enabled = true;
      firstSweepCompleted = true;

      log( 'sweep result %d out of %d', includedCount, cn.size( ctl.ev ) );

      // enable all the widgets ( if modal is not taken )
      if ( !modalTaken ) {

        _forEachWidget( 'enable', currentRequestParams );

      }

    }, 10 );

  }


  function _trasverseInclude( targetWidget ) {

    var counter = 0;

    // go through each event, determine if should be included
    // .. in which case include in widgets
    for ( var i in ctl.ev ) {

      if ( _applyFilters( ctl.ev[i], currentRequestParams ) ) {

        counter++;

        ctl.ev[ i ].passed = _isPassed( ctl.ev[ i ] );

        _include( ctl.ev[i], currentRequestParams, targetWidget );

      }
    
    }

    return counter;

  }


  /**
   * have there been any changes in parameters?
   */
  
  function isDifferent( data ) {

    for ( var i in currentRequestParams ) {

      if ( typeof data[i] == 'undefined' || data[i] !== currentRequestParams[i] ) return true;

    }

    for ( i in data ) {

      if ( typeof currentRequestParams[i] == 'undefined' ) return true;

      if ( data[i] !== currentRequestParams[i] ) return true;

    }

    return false;

  }


  /**
   * as part of sweep, tell widgets event item passed through filters
   */
  
  function _include( item, p, targetWidget ) {

    if ( targetWidget ) {

      targetWidget.include( item, p );

    } else {

      for ( var i = widgets.length - 1; i >= 0; i-- ) {

        if ( widgets[ i ].include ) {

          widgets[i].include( item, p );  

        }

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

    var cleanData = {}, tags;

    for ( var k in data ) {

      if ( data[ k ] !== null ) {

        if ( [ 'neLat', 'neLng', 'swLat', 'swLng' ].indexOf( k ) !== -1 ) {

          cleanData[ k ] = parseFloat( data[ k ] );

        } else if ( k == 'tags' ) {

          if ( cn.isArray( data[ k ] ) && data[ k ].length ) {

            tags = data[ k ].filter( function( t ) {

              return t.length;

            });

            if ( tags.length ) cleanData[ k ] = tags;

          }

        } else if ( k == 'what' ) {

          if ( data[ k ].length ) {

            cleanData[ k ] = data[ k ];

          }

        } else if ( k === 'uid' ) {

          cleanData[ k ] = parseInt( data[ k ] );

        } else {

          cleanData[ k ] = data[ k ];

        }

      }

    }

    return cleanData;

  }


  function _isPassed( eItem ) {

    var today = _stringifyDate( new Date() );

    for ( var i = eItem.d.length - 1; i >= 0; i-- ) {
      
      if ( eItem.d[ i ] >= today ) return false;

    };

    return true;

  }

  function _updateHrefQuery( updatedQuery ) {

    log( 'attempting to update href query' );

    var href = window.location.href, dashPart = false, query = false, queryPart;

    if ( href.split( '#' ).length > 1 ) {

      dashPart = href.split( '#' )[ 0 ];

    }

    href = href.split( '?' )[ 0 ];

    if ( ( typeof window.history == 'undefined' ) || ( typeof window.history.pushState == 'undefined' ) ) {

      log( 'window.history is not available' );

    } else {

      query = _readHrefQuery();
      
      if ( cn.size( updatedQuery ) ) {

        query.oaq = updatedQuery;

      } else {

        delete query.oaq;

      }

      if ( cn.size( query ) ) {

        href = href + '?' + qs.stringify( query );

      }

      if ( dashPart ) {

        href = href + '#' + dashPart;

      }

      if ( ( typeof window.history !== 'undefined' ) && ( typeof window.history.pushState !== 'undefined' ) ) {

        window.history.pushState( updatedQuery, null, href );
        
      }

      
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

  function _redirectLegacySearch() {

    var queryParts = window.location.href.split( '#' )[ 0 ].split( '?' ).slice( 1 );

    if ( !queryParts.length ) return;

    if ( queryParts[ 0 ].replace( '%5B', '[' ).replace( '%5D', ']' ).indexOf( 'search[' ) !== -1 ) {

      window.location.href = window.location.href.replace( /search\[/g, 'oaq[' ).replace( /search%5B/g, 'oaq%5B' );

    }

  }

  function _stringifyDate( d ) {

    if ( !d ) d = new Date();

    return [ d.getFullYear(), _fZ( d.getMonth() + 1 ), _fZ( d.getDate() ) ].join( '-' );

  }

  function _fZ( str ) {

    if ( ( str + '' ).length == 1 ) {

      return '0' + str;

    }

    return str;

  }

}
