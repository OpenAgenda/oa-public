"use strict";

exports.setOnReady = setOnReady;

var UID = 0,

LANG = 1,

cn = require(  '../../js/lib/common/common.mod.js' ),

remote = require( '../../js/lib/remote/remote.mod.js' ),

EJS = require( '../../js/lib/clientEjs/ejs' ),

wLib = require(  '../lib/widgetLib' ),

debug = require( 'debug' ),

baseConfig = require( './config.js' ),

history = require( './history' ),

mapLib = require( '../../js/lib/maps/osm.maps.mod' ),

templates = {
  main: require( './main.ejs' ),
  popup: require( './popup.ejs' )
},

env = window.env ? window.env : 'prod',

res = {
  all: {
    location: '//openagenda.com/locations/{uid}.json'
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

if ( cn.contains( [ 'tpl', 'dev' ], env ) ) debug.enable( '*' );

res = cn.extend( res.all, res[ env ] ? res[ env ] : {} );

function widget( elem, options ) {

  var log,

  m,

  config = cn.extend( {}, baseConfig ),

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

  enabled = false,

  map,

  popup,

  frozenAuto = false,

  embedMode,

  useClusters = false,

  clusterGroup = false,

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

      if ( !m ) _initMapLib( data.ebd && data.ebd.mt ? data.ebd.mt : config.tiles );

      if ( !data.ebd || data.ebd.dcss ) styler( style );

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

    useClusters = cn.size( locations ) > config.clusterThreshold;

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

      clusterGroup = m.createCluster( map, markers );

    }

  }


  function enable( reqParams ) {

    log( 'enabling map' );

    enabled = true;

    _updateBounds( reqParams, function( ) {

      var popupLocation = false;

      if ( !reqParams.location ) {

        log( 'no location is set in request' );

        selectedLocation = false;

        if ( popup ) {

          m.removePopup( popup );

        }

      }

      selectedEvent = reqParams.uid ? reqParams.uid : false;

      if ( selectedEvent && activeLocations.length ) {

        popupLocation = locations[ activeLocations[ 0 ] ];

      } else if ( reqParams.location ) {

        log( 'location is specified in request: %s', reqParams.location );

        popupLocation = selectedLocation = locations[ parseInt( reqParams.location, 10 ) ];

      }

      _refresh();

      if ( popupLocation ) _openPopup( popupLocation );

    } );

  }
  

  function _openPopup( l ) {

    _fetchLocationInfo( l, function( err, location ) {

      var popupData = cn.extend({
        labels: config.labels[ config.lang ]
      }, l );

      _closePopup();

      popup = m.createPopup( map, new EJS({ text: templates.popup }).render( popupData ), { marker: l.marker });

    } );

  }

  function _closePopup() {

    if ( popup ) {

      m.removePopup( popup );

      popup = false;

    }

  }

  function disable() {

    log( 'disabling' );

    enabled = false;

    _refresh();

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

    if ( cn.contains( activeLocations,  eventItem.l ) ) return;

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

      cn.extend( location, data, { uid: location.uid /* for template testing */} );

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
      
      if ( !selectedLocation && !cn.contains( activeLocations, location.uid ) ) {

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


      if ( cn.contains( passedLocations, location.uid ) ) {

        updatedReqParams.passed = '1';

      }

      _update( updatedReqParams );

    });

  }


  function _unsetLocationParams() {

    return {
      location: null,
      neLat: null,
      neLng: null,
      swLat: null,
      swLng: null
    };

  }


  function _setLocationParams( location, clear ) {

    log( 'setting location to %s', location.uid );

    var updateValues = {
      neLat: null,
      neLng: null,
      swLat: null,
      swLng: null,
      location: location.uid
    }

    if ( clear ) {

      cn.extend( updateValues, {
        from: null,
        to: null,
        what: null,
        categories: null,
        tags: null
      });

    }

    return updateValues;

  }


  function _refresh() {

    var markers = [];

    log( 'refreshing map: %s', enabled ? 'enabled' : 'not enabled' );

    if ( selectedLocation ) {
          
      activeLocations = [ selectedLocation.uid ];

      m.setCenter( map, selectedLocation.coords );

    }

    if ( useClusters && clusterGroup ) {


      try { // try - mitigate ie10 exception

        m.clearClusterLayers( clusterGroup );

      } catch( e ) {

        log( 'could not clear cluster layers' );

      }


    }

    for ( var l in locations ) {
      
      markers.push( _refreshMarker( locations[ l ] ) );
    
    }

    if ( useClusters && clusterGroup ) {

      m.addClusterLayers( clusterGroup, markers );

    }

  }


  function setOnBoundsChange( cb ) {

    log( 'setting onboundschange callback' );
        
    onBoundsChangeCallback = cb;

  }


  function _refreshMarker( location ) {

    var active = ( enabled && cn.contains( activeLocations, location.uid ) );

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

      cn.el( 'head' ).appendChild( link );

    } else {

      document.createStyleSheet( config.leafletCss );
      document.createStyleSheet( config.leafletCssIE );

    }

  }


  function _initLocations( data ) {

    cn.forEach( data.ev, function( ev ) {

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

    if ( !cn.size( locations ) ) {

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

    var mapParams = cn.extend( {
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

    div.innerHTML = new EJS( {text: templates.main } ).render( {
      labels : config.labels[ config.lang ]
    } );

    if ( cn.el( elem, config.selectors.syncSection ) ) {

      div.removeChild( cn.el( div, config.selectors.syncSection ) );

      div.appendChild( cn.el( elem, config.selectors.syncSection ) );

    }

    elem.innerHTML = div.innerHTML;

    m.createMap( cn.el( elem, 'div'), { center: mapParams.center, zoom: mapParams.zoom, onReady: function( newMap ) {

      map = newMap;

      log( 'created map' );

      if ( cb ) cb();

    }});

  }

  function _defaultCenter() {

    var center = [ 48.8705187, 2.3821144 ];

    if ( locations && cn.size( locations ) ) {
      
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

    sw = m.getBoundsSouthWest( bounds );

    return {
      neLat: ne[0],
      neLng: ne[1],
      swLat: sw[0],
      swLng: sw[1]
    };

  }


  function _selectBounds( bounds, updateMap ) {

    log( 'selecting bounds' );

    if ( typeof updateMap == 'undefined' ) updateMap = false;

    _update( cn.extend({ location: null }, _getBoundParams( bounds ) ) );

    if ( updateMap ) {

      _fitBounds( bounds, true );

    }

  }


  function _update( params ) {

    controller.update( 'map', params );

  }


  function _updateBounds( reqParams, cb ) {

    var bounds = false;

    if ( navHistory.matchCurrent( reqParams ) ) {

      bounds = false;

    } else if ( navHistory.matchPrev( reqParams ) ) {

      bounds = navHistory.back();

    } else if ( activeBounds ) {

      bounds = activeBounds;

      navHistory.add( reqParams, bounds );

    }

    // carry out the repositionning

    _freezeAuto();

    // the leaflet api pretends things are synchronous. They are not.
    setTimeout( function() {

      if ( bounds ) _fitBounds( bounds, true );

      // takes a while for map to adjust
      
      setTimeout(function() {

        _unfreezeAuto();

        return cb ? cb() : null;

      }, 500);

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

    m.fitBounds( map, bounds );

    log( 'prevent map to exceed min zoom' );

    if ( !ignoreZoomLimit && ( m.getZoom( map ) < config.minZoom ) ) {

      m.setZoom( map, config.minZoom );

    }

  }


  function _bindSync() {

    cn.addEvent( cn.el( elem, config.selectors.sync ), 'change', function( e ) {

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

    cn.el( elem, config.selectors.sync ).checked = false;

  }


  function _activateSync() {

    cn.el( elem, config.selectors.sync ).checked = true;

    config.auto = true;

  }


  function _getNeighborBounds( location ) {

    log( 'defining neighborhood bounds of location %s', location.u );

    var bounds = false, nCount = 0,

    distanceThreshold = config.zoomToDistance[ m.getZoom( map ) ];

    log( 'distance threshold is set at %d', distanceThreshold );

    for ( var l in locations ) {

      // is this is a neighbor?
      if ( ( l !== location.l ) && _distance( locations[ l ].coords[0], locations[ l ].coords[1], location.coords[0], location.coords[1]) < distanceThreshold ) {

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


require( '../lib/controllerLoader' )( function( register ) {

  wLib.forEachAnchor( '.cbpgmp', { register: register }, widget );

} );