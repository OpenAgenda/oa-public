"use strict";

var domain = require( '../../domain' );

exports.setOnReady = setOnReady;

var UID = 0,

LANG = 1,

du = require( '../../js/lib/domUtils' ),

utils = require( '@openagenda/utils' ),

remote = require( '../../js/lib/remote/remote.mod.js' ),

wLib = require(  '../lib/widgetLib' ),

debug = require( 'debug' ),

baseConfig = require( './config.js' ),

history = require( './history' ),

mapLib = require( '../../js/lib/maps/osm.maps.mod' ),

utils = require( '@openagenda/utils' ),

templates = {
  main: require( './main.ejs' ),
  popup: require( './popup.ejs' )
},

env = window.env ? window.env : 'production',

res = {
  all: {
    location: '//' + domain + '/locations/{uid}.json'
  },
  dev: {
    location: '//d.openagenda.com/locations/{uid}.json'
  },
  tpl: {
    location: '/server/testdata/location.json'
  }
},

style = require( './style.css' ),

styler = require( '../lib/widgetStyler' ),

onReady; // cb to call when a widget is ready

if ( [ 'tpl', 'development' ].indexOf( env ) !== -1 ) debug.enable( '*' );

res = utils.extend( res.all, res[ env ] ? res[ env ] : {} );

function widget( elem, options ) {

  var log,

  m,

  config = utils.extend( {}, baseConfig ),

  controller,

  locations = {},

  // when map position bounds are reset, they are reset to this
  baseBounds,

  selectedLocation,

  selectedEvent,

  activeLocations = [],

  activeBounds,

  navHistory = history(),

  passedLocations = [],

  onBoundsChangeCallback,

  firstEnabled = true,

  enabled = false,

  map,

  popup, popupMarker,

  frozenAuto = false,

  embedMode,

  useClusters = false,

  clusterGroup = false,

  initCluster = false, // for clearing cluster at first enable

  boundsQueue = [],

  processingQueue = false;

  return ( function() {

    var uid = options.anchorConfig[ UID ],

    mapAttributes;

    log = debug( 'map widget ' + uid );

    mapAttributes = _getMapInitAttributes();

    embedMode = uid.split( '/' ).length == 2;

    log( 'initing' );

    controller = options.register( wLib.interface( 'map', uid, {
      enable : enable,
      disable : disable,
      clear : clear,
      change : change,
      include : include,
      setOnBoundsChange : setOnBoundsChange
    } ) );

    _initSettings( options.anchorConfig );

    if ( mapAttributes ) {

      // init map config is loaded in elem,
      // map can be initialized before control
      // data is in hand

      _initMapLib( mapAttributes.tiles );

      _createMap( mapAttributes );

      baseBounds = m.getBounds( map );

    }

    controller.getControlData( function( data ) {
      
      log( 'control data fetched' );

      if ( !data.ebd || data.ebd.dcss.map ) styler( style );

      if ( !m ) _initMapLib( data.ebd && data.ebd.mt ? data.ebd.mt : config.tiles );

      _initLocations( data );

      _initIcons( data );

      // base bounds has been defined if config is set in
      // widget attributes
      if ( typeof baseBounds === 'undefined' ) _defineBaseBounds( data );

      log( 'init complete, enable to render' );

      _createMap( {
        center: _defaultCenter()
      }, function() {

        _bindSync();

        _boundsChangeBehavior();

        _setMapToBaseBounds();

        _initMarkers();

        _initAutoSync( data );

        controller.onWidgetReady( 'map', { uid } );

        if ( onReady ) onReady();

      } );


    } );

    
  } )();


  /**
   * extract optional map init data
   * 
   * if tiles & coords are set as widget attributes
   * they can be used for initing the map
   * before the control data is available
   */

  function _getMapInitAttributes() {

    var coords, zoom = 15, tiles;

    if ( !elem.hasAttribute( config.coordAttribute ) || !elem.hasAttribute( config.tilesAttribute ) ) {

      log( 'map attributes not set in widget elem. waiting for control data' );

      return false;

    }

    tiles = elem.getAttribute( config.tilesAttribute );

    coords = elem.getAttribute( config.coordAttribute ).split( '|' );

    if ( coords.length == 3 ) {

      zoom = parseInt( coords.pop(), 10 );

    }

    return {
      center: coords.map( function( c ) { return parseFloat( c ); } ),
      zoom: zoom,
      tiles: tiles
    };

  }


  function _initMarkers() {

    var markers = [];

    useClusters = utils.size( locations ) > config.clusterThreshold;

    useClusters = true;

    for ( var l in locations ) {

      var location = locations[ l ];

      location.marker = m.createMarker( useClusters ? false : map, {
        position: location.coords,
        icon: config.icons.inactive.icon,
        anchor: config.icons.inactive.anchor
      } );

      markers.push( location.marker );

      _setOnMarkerClick( location );

      _refreshMarker( location );

    }

    if ( useClusters ) {

      try {

        clusterGroup = m.createCluster( map, [] );

        clusterGroup.markerCount = 0;

      } catch( e ) {

        console.error( e );

        console.error( 'markercluster lib crashed at cluster creation' );

      }

    }

  }


  function _resetClusterController( reqParams ) {

    var current = navHistory.get();

    if ( current.uid !== reqParams.uid ) {

      // if there is a change in opened event,
      // cluster must be reset only if markerCount changed
      if ( clusterGroup.markerCount < activeLocations.length ) {

        return true;

      }

    } else {

      // if is not a map filter change, reset cluster
      if ( _nonMapQueryChange( reqParams ) ) return true;
      
    }

    
    // if it is a lateral movement of map, must be reset
    // else, it means bits of maps are now shown that were not shown before.

    if ( current.neLat < reqParams.neLat ) return true;

    if ( current.neLng < reqParams.neLng ) return true;

    if ( current.swLat > reqParams.swLat ) return true;

    if ( current.swLng > reqParams.swLng ) return true;

    return false;

  }


  function _nonMapQueryChange( reqParams ) {

    var keys = [], change = false,

    current = navHistory.get();

    for( var i in reqParams ) {

      keys.push( i );

    }

    for( i in current ) {

      keys.push( i );

    }

    utils.forEach( keys, function( k ) {

      if ( [ 'neLat', 'neLng', 'swLat', 'swLng', 'location' ].indexOf( k ) == -1 ) {

        if ( JSON.stringify( reqParams[ k ] ) !== JSON.stringify( current[ k ] ) ) {

          change = true;

        }

      }

    });

    return change;

  }


  function enable( reqParams ) {

    var resetCluster = _resetClusterController( reqParams ) || !initCluster,

    bounds = false;

    initCluster = true;

    log( 'enabling map' );

    enabled = true;

    log( 'defining bounds from navigation history and update' );

    if ( navHistory.matchCurrent( reqParams ) ) {

      log( 'history implies no new change. Bounds do not move' );

      bounds = false;

    } else if ( navHistory.matchPrev( reqParams ) ) {

      log( 'nav update shows history back. Moving bounds to previous state' );

      bounds = navHistory.back();

    } else if ( reqParams.neLat && navHistory.current() ) {

      log( 'nav update includes bound definition. Bounds do not change' );

      bounds = false;

      navHistory.add( reqParams, navHistory.current() );

    } else if ( firstEnabled && ( !utils.size( reqParams ) || _hasOnlyPassedParams( reqParams ) ) ) {

      log( 'nav is init nav, no params are set or only passed events exist' );

      bounds = baseBounds;

      navHistory.add( reqParams, bounds );

    } else if ( reqParams.uid ) {

      log( 'nav update includes event selection. Bounds are defined around event' );

      bounds = m.createBounds( locations[ activeLocations[ 0 ] ].coords );

      navHistory.add( reqParams, bounds );

    } else if ( activeBounds ) {

      // query params have changed and DO NOT contain geographical
      // parts. bounds should be that of the active markers
      bounds = activeBounds;

      navHistory.add( reqParams, bounds );

    } else {

      navHistory.add( reqParams, bounds );

    }

    firstEnabled = false;

    _updateBounds( bounds, function() {

      var popupLocation = false;

      if ( !reqParams.location ) {

        log( 'no location is set in request' );

        selectedLocation = false;

        _closePopup();

      }

      selectedEvent = reqParams.uid ? reqParams.uid : false;

      if ( selectedEvent && activeLocations.length ) {

        popupLocation = locations[ activeLocations[ 0 ] ];

      } else if ( reqParams.location ) {

        log( 'location is specified in request: %s', reqParams.location );

        popupLocation = selectedLocation = locations[ parseInt( reqParams.location, 10 ) ];

      }

      _refresh( resetCluster );

      if ( popupLocation ) _openPopup( popupLocation );

    } );

  }


  function _hasOnlyPassedParams( reqParams ) {

    return utils.size( reqParams ) == 1 && reqParams.passed !== undefined;

  }
  

  function _openPopup( l ) {

    _fetchLocationInfo( l, function( err, location ) {

      var popupData = utils.extend({
        labels: config.labels[ config.lang ]
      }, l );

      _closePopup();

      popupMarker = m.createMarker( map, {
        position: location.coords,
        icon: config.icons.inactive.icon,
        anchor: config.icons.inactive.anchor
      } );

      popup = m.createPopup( map, templates.popup( popupData ), { marker: popupMarker });

    } );

  }

  function _closePopup() {

    if ( !popup ) return;

    m.removePopup( popup );
    popup = false;

    if ( popupMarker ) {

      map.removeLayer( popupMarker );
      popupMarker = undefined;

    }

  }

  function disable() {

    log( 'disabling' );

    enabled = false;

    _refresh( false );

  }

  function clear() {

    log( 'clearing' );

    activeLocations = [];

    passedLocations = [];

    activeBounds = false;

    if ( popup ) m.removePopup( popup );

    for ( var l in locations ) {

      locations[ l ].count = 0;
    
    }

  }

  function change() {}

  function include( eventItem, reqParams ) {

    if ( activeLocations.indexOf( eventItem.l ) !== -1 ) return;

    if ( !eventItem.l || !locations[ eventItem.l ] ) return;

    activeLocations.push(  eventItem.l );

    if ( eventItem.passed ) {

      passedLocations.push(  eventItem.l );

    }

    locations[ eventItem.l ].count += 1;

    _includeInActiveBounds( locations[ eventItem.l ] );

  }


  function _includeInActiveBounds( location ) {

    if ( !activeBounds ) {

      activeBounds = m.createBounds( location.coords );

    } else {

      m.extendBounds( activeBounds, location.coords );

    }

  }

  function _fetchLocationInfo( location, cb ) {

    if ( location.slug ) return cb( null, location );

    remote.get( res.location.replace( '{uid}', location.uid ), {}, function( responseType, data ) {

      if ( responseType !== 'success' ) {

        log( 'could not fetch location detail' );

        return;

      }

      utils.extend( location, data, { uid: location.uid /* for template testing */} );

      cb( null, location );

    }, _isAjax() );

  }


  function _isAjax() {

    if ( embedMode && ( window.env !== 'tpl' ) ) {

      return false;

    }

    return true;

  }


  function _setOnMarkerClick( location ) {

    m.setOnMarkerClick( location.marker, function() {

      var updatedReqParams = {};

      log( 'clicked marker of location "%s"', location.uid );

      if ( !useClusters ) {

        // if there are neighbors, redefine bounds

        var neighborhoodBounds = _getNeighborBounds( location );


        if ( neighborhoodBounds ) {

          return ( config.auto ? _selectBounds : _fitBounds )( neighborhoodBounds, true );

        }

      }
      
      if ( !selectedLocation && ( activeLocations.indexOf( location.uid ) == -1 ) ) {

        // if location is not in active locactions,
        // clicking it will cancel current selection

        updatedReqParams = _setLocationParams( location, true );

      } else if ( selectedLocation && ( selectedLocation.uid == location.uid ) ) {

      // if location is in part of current selection,
      // clicking it will remove it

        updatedReqParams = _unsetLocationParams();

      } else {

        // if location is not selected,
        // add it to current selection

        updatedReqParams = _setLocationParams( location );

      }

      if ( passedLocations.indexOf( location.uid ) !== -1 ) {

        updatedReqParams.passed = '1';

      }

      _update( updatedReqParams );

    });

  }


  function _unsetLocationParams() {

    return {
      location: null
    };

  }


  function _setLocationParams( location, clear ) {

    log( 'setting location to %s', location.uid );

    var updateValues = {
      /*neLat: null,
      neLng: null,
      swLat: null,
      swLng: null,*/
      location: location.uid
    }

    if ( clear ) {

      utils.extend( updateValues, {
        from: null,
        to: null,
        what: null,
        categories: null,
        tags: null
      });

    }

    return updateValues;

  }


  function _refresh( resetCluster ) {

    var markers = [];

    resetCluster = typeof resetCluster == 'undefined' ? false : resetCluster;

    log( 'refreshing map: %s', enabled ? 'enabled' : 'not enabled' );

    if ( selectedLocation ) {
          
      activeLocations = [ selectedLocation.uid ];

      m.setCenter( map, selectedLocation.coords );

    }

    if ( enabled && useClusters && clusterGroup && resetCluster ) {

      log( 'resetting cluster' );

      try { // try - mitigate ie10 exception

        m.clearClusterLayers( clusterGroup );

        clusterGroup.markerCount = 0;

      } catch( e ) {

        log( 'could not clear cluster layers' );

      }


    }


    activeLocations.forEach( function( l ) {

      markers.push( _refreshMarker( locations[ l ] ) );

    } );


    if ( enabled && useClusters && clusterGroup && resetCluster ) {

      _addClusterLayers( clusterGroup, markers );

      clusterGroup.markerCount = activeLocations.length;

    }

  }

  function _addClusterLayers( clusterGroup, markers ) {

    var extract = markers.splice( 0, 4000 );

    try {
        
      m.addClusterLayers( clusterGroup, extract );

    } catch( e ) {

      console.error( 'cluster lib crash: %s', e );

    }

    if ( markers.length ) setTimeout( function() {

      _addClusterLayers( clusterGroup, markers );

    }, 500 );

  }

  function setOnBoundsChange( cb ) {

    log( 'setting onboundschange callback' );
        
    onBoundsChangeCallback = cb;

  }


  function _refreshMarker( location ) {

    var active = ( enabled && ( activeLocations.indexOf( location.uid ) !== -1 ) );

    m.setMarkerIcon( location.marker, config.icons[ active ? 'active' : 'inactive' ] );

    m.setMarkerZIndex( location.marker, active ? 1000 : -1000 );

    // for count display of marker cluster
    location.marker.options.count = active ? 1 : 0;

    return location.marker;

  }


  function _initTiles( data ) {

    if ( data.tiles ) {

      config.tiles = data.tiles;

      return;

    }

    if ( !data.ebd || !data.ebd.mt ) {

      log( 'using default tiles' );

      return;

    }

    config.tiles = data.ebd.mt;

  }



   // initialize map object

  function _initSettings( anchorConfig ) {

    if ( anchorConfig.length > 1 ) {

      config.lang = anchorConfig[LANG];

    }

    if ( elem.hasAttribute( 'data-lang' ) ) {

      config.lang = elem.getAttribute( 'data-lang' );

    }

    if (typeof document.createStyleSheet == "undefined") {

      var link = document.createElement( 'link' );
      
      link.setAttribute( 'rel', 'stylesheet' );
      link.setAttribute( 'type', 'text/css' );
      link.setAttribute( 'href', '//s3-eu-west-1.amazonaws.com/cibulstatic/leaflet-0.6.4.css');

      du.el( 'head' ).appendChild( link );

    } else {

      document.createStyleSheet( config.leafletCss );
      document.createStyleSheet( config.leafletCssIE );

    }

  }


  function _initLocations( data ) {

    utils.forEach( data.ev, function( ev ) {

      if ( !ev.l ) return;

      if ( !ev.lt || !ev.lg ) {

        return;

      }

      locations[ ev.l ] = {
        uid: ev.l,
        coords: [ ev.lt, ev.lg ],
        passed: ev.p
      }

    });

  }


  function _initIcons( data ) {

    if ( !data.ebd || !data.ebd.mi ) return;

    if ( data.ebd.mi.a ) {

      config.icons.active.icon = data.ebd.mi.a;
      config.icons.active.anchor = [data.ebd.ms.a[0]/2, data.ebd.ms.a[1]];
      config.icons.active.size = [data.ebd.ms.a[0], data.ebd.ms.a[1]];

    }

    if ( data.ebd.mi.i ) {

      config.icons.inactive.icon = data.ebd.mi.i;
      config.icons.inactive.anchor = [data.ebd.ms.i[0]/2, data.ebd.ms.i[1]];
      config.icons.inactive.size = [data.ebd.ms.i[0], data.ebd.ms.i[1]];

    }

  }


  function _defineBaseBounds( data ) {

    var mode = 'all';

    if (data.ebd && data.ebd.mp) mode = data.ebd.mp;

    if ( ( mode == 'manual' ) && data.ebd.mc && data.ebd.mc.neLat ) {

      return _initManualBounds( data.ebd.mc );

    } else {

      _initAllInclusiveBounds( data.p );

    }

  }


  function _initAutoSync( data ) {

    var auto = false;

    if ( data.ebd && data.ebd.ma ) auto = data.ebd.ma;

    // if geolocation is used, controller sets it to true
    // and preempts default config
    if ( data.geolocate ) auto = true;

    config.auto = auto;

    if ( config.auto ) _activateSync();

  }


  function _initManualBounds( corners ) {

    baseBounds = m.createBounds( [ corners.neLat, corners.neLng ] );

    m.extendBounds( baseBounds, [ corners.swLat, corners.swLng ] );

  }


  
  // define initial bounds to have them include all upcoming
  // markers. Or all markers if agenda is fully passed

  function _initAllInclusiveBounds( isPassed ) {

    if ( !utils.size( locations ) ) {

      log( 'no location is defined, cannot define bounds.' );

      return;

    }

    if (typeof baseBounds !== 'undefined') {

      log( 'adjusting map to base bounds' );

      _fitBounds( baseBounds );

      return;

    }

    // include all locations in base bounds

    log( 'defining base bounds' );

    for ( var l in locations ) {

      if ( isPassed || !locations[ l ].passed ) {

        if ( typeof baseBounds == 'undefined' ) {

          baseBounds = m.createBounds( locations[ l ].coords );

        } else {

          m.extendBounds( baseBounds, locations[ l ].coords );

        }

      }

    }


    // if bounds is still not defined, just pick first location
    
    if ( typeof baseBounds == 'undefined' ) {

      for ( l in locations ) break;

      baseBounds = m.createBounds( locations[l].coords );

    }

  }

  function _initMapLib( tiles ) {

    if ( m ) return;

    if ( !tiles ) tiles = config.tiles;

    log( 'using osm with tiles %s', tiles );

    m = mapLib( { url: tiles });

  }


  function _createMap( options, cb ) {

    var mapParams = utils.extend( {
      tiles: config.tiles,
      center: false, // needed
      zoom: 15
    }, options );

    if ( map ) {

      log( 'map is already created' );

      if ( cb ) cb();

      return;

    }

    var div = document.createElement( 'div' );

    div.innerHTML = templates.main( {
      labels : config.labels[ config.lang ]
    } );

    if ( du.el( elem, config.selectors.syncSection ) ) {

      div.removeChild( du.el( div, config.selectors.syncSection ) );

      div.appendChild( du.el( elem, config.selectors.syncSection ) );

    }

    elem.innerHTML = div.innerHTML;

    m.createMap( du.el( elem, 'div'), { center: mapParams.center, zoom: mapParams.zoom, onReady: function( newMap ) {

      map = newMap;

      log( 'created map' );

      if ( cb ) cb();

    }});

  }

  function _defaultCenter() {

    var center = [ 48.8705187, 2.3821144 ];

    if ( locations && utils.size( locations ) ) {
      
      for ( var s in locations ) break;

      center = locations[ s ].coords;

    }

    return center;

  }


  function _boundsChangeBehavior() {

    m.setOnBoundsChangeEnd( map, function() {

      navHistory.sync( m.getBounds( map ) );

      if ( selectedEvent ) return;

      log( 'bounds changed, automatic marker selection is %s and widget is %s', config.auto ? 'on' : 'off', enabled ? 'enabled' : 'disabled' );

      if ( enabled && config.auto && !frozenAuto ) {

        _selectBounds();

      }

      if ( onBoundsChangeCallback ) {

        log( 'giving bounds to onChangeCallback' );

        onBoundsChangeCallback( _getBoundParams() );

      }

    });

  }


  function _getBoundParams( bounds ) {

    if ( typeof bounds == 'undefined' ) {

      bounds = m.getBounds( map );

    }

    var ne = m.getBoundsNorthEast( bounds ),

    sw = m.getBoundsSouthWest( bounds ),

    boundParams = {
      neLat: ne[0],
      neLng: ne[1],
      swLat: sw[0],
      swLng: sw[1]
    };

    return boundParams;

  }


  function _selectBounds( bounds, updateMap ) {

    log( 'selecting bounds' );

    if ( typeof updateMap == 'undefined' ) updateMap = false;

    _update( utils.extend({ location: null }, _getBoundParams( bounds ) ) );

    if ( updateMap ) {

      _fitBounds( bounds, true );

    }

  }


  function _update( params ) {

    controller.update( 'map', params );

  }


  function _updateBounds( bounds, cb ) {

    // carry out the repositionning

    _freezeAuto();

    // the leaflet api pretends things are synchronous. They are not.
    setTimeout( function() {

      // fit bounds does not ignore zoom extremes
      if ( bounds ) _fitBounds( bounds );

      // takes a while for map to adjust
      
      setTimeout(function() {

        _unfreezeAuto();

        return cb ? cb( bounds ) : null;

      }, 500 );

    }, 100 );

  }

  
  // default bounds encapsulate all the locations
  function _setMapToBaseBounds() {

    log( 'setting map to base bounds: %s', JSON.stringify( baseBounds ) );

    if ( !baseBounds ) return;
    
    _fitBounds( baseBounds );

  }


  /**
   * avoid auto panning sync issues
   * by temporarily preventing it during updates
   */
  
  function _freezeAuto() {

    frozenAuto = true;

  }

  function _unfreezeAuto() {

    frozenAuto = false;

  }


  function _fitBounds( bounds, ignoreZoomLimit ) {

    if ( typeof ignoreZoomLimit == 'undefined' ) {

      ignoreZoomLimit = false;

    }

    try {

      m.fitBounds( map, bounds );

    } catch( e ) {

      console.log( 'caught error while fitting bounds. waiting a tiny bit before trying again' );
      console.log( e );

      setTimeout( function() {

        _fitBounds( bounds, ignoreZoomLimit );
        
      }, 500 );

    }

    log( 'prevent map to exceed min zoom' );

    if ( ignoreZoomLimit ) return;

    _boundMapZoom();

  }


  function _boundMapZoom() {

    if ( m.getZoom( map ) < config.minZoom ) {

      m.setZoom( map, config.minZoom );

    } else if ( m.getZoom( map ) > config.maxZoom ) {

      m.setZoom( map, config.maxZoom )

    }

  }


  function _maxBoundDiff( bounds ) {

    var mapBounds = m.getBounds( map ),

    mapNE = m.getBoundsNorthEast( mapBounds ),

    mapSW = m.getBoundsSouthWest( mapBounds ),

    boundsNE = m.getBoundsNorthEast( bounds ),

    boundsSW = m.getBoundsSouthWest( bounds );

    return Math.max(
      _distance( mapNE[ 0 ], mapNE[ 1 ], boundsNE[ 0 ], boundsNE[ 1 ] ),
      _distance( mapSW[ 0 ], mapSW[ 1 ], boundsSW[ 0 ], boundsSW[ 1 ] )
    );

  }


  function _bindSync() {

    du.addEvent( du.el( elem, config.selectors.sync ), 'change', function( e ) {

      config.auto = !config.auto;

      log( 'sync of bounds filter with moving map: %s', config.auto ? 'on' : 'off' );

      if ( config.auto ) {

        _selectBounds();

      } else {

        _update({
          neLat: null,
          neLng: null,
          swLat: null,
          swLng: null,
          location: null
        });

      }

    });

  }


  function _deactivateSync() {

    config.auto = false;

    du.el( elem, config.selectors.sync ).checked = false;

  }


  function _activateSync() {

    du.el( elem, config.selectors.sync ).checked = true;

    config.auto = true;

  }


  function _getNeighborBounds( location ) {

    log( 'defining neighborhood bounds of location %s', location.u );

    var bounds = false, nCount = 0,

    distanceThreshold = config.zoomToDistance[ m.getZoom( map ) ];

    log( 'distance threshold is set at %d', distanceThreshold );

    for ( var l in locations ) {

      // is this a neighbor?
      if ( ( parseInt( l, 10 ) !== location.uid ) && _distance( locations[ l ].coords[0], locations[ l ].coords[1], location.coords[0], location.coords[1]) < distanceThreshold ) {

        nCount++;

        if ( !bounds ) bounds = m.createBounds( location.coords );

        m.extendBounds( bounds, locations[l].coords );

      }

    }

    log( 'found %d neighbors', nCount );

    return bounds;
    
  }


  function _distance( lat1, lon1, lat2, lon2 ) {
  
    var radlat1 = Math.PI * lat1 / 180,
    
    radlat2 = Math.PI * lat2 / 180,
    
    radlon1 = Math.PI * lon1 / 180,
    
    radlon2 = Math.PI * lon2 / 80,
    
    radtheta = Math.PI * (lon1-lon2)/180;
    
    return 60 * 1.1515 * 1609.344 * 180/Math.PI * Math.acos(Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta));

  };

};

function _isIn( l, reqParams ) {

  if ( reqParams.neLat && reqParams.neLng && reqParams.swLat && reqParams.swLng ) {

    var ne = [ parseFloat(reqParams.neLat), parseFloat(reqParams.neLng) ], 

    sw = [parseFloat(reqParams.swLat), parseFloat(reqParams.swLng)],

    lt = parseFloat( l.coords[ 0 ] ),

    lg = parseFloat( l.coords[ 1 ] );

    if ( (lt <= ne[0] ) &&

      ( lg <= ne[1] ) &&

      ( lt >= sw[0] ) &&

      ( lg >= sw[1]) ) return true;

    return false;

  }

  return true;

}

function _fZ( n ) {

  return ( n>9?'':'0' ) + n;

};


function setOnReady( cb ) {

  onReady = cb;

}


require( '../lib/loader' )( {
  selector: '.cbpgmp',
  widget: widget,
  backup: {
    selector: '[data-oamp]',
    classNames: 'cibulMap'
  }
} );
