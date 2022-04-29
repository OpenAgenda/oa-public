'use strict';

const SYNC_SECTION_SELECTOR = '.js_map_sync';

const attributeValues = require('./lib/attributeValues');
const getEventLocationUid = require('./lib/getEventLocationUid');
const loadInitialState = require('./lib/loadInitialState');
const applyLeafletStylesheet = require('./lib/applyLeafletStylesheet');
const promisify = require('./lib/promisify');
const styler = require('../lib/widgetStyler');
const du = require('@openagenda/dom-utils');
const utils = require('@openagenda/utils');

import style from './lib/style.css';

exports.setOnReady = setOnReady;

const domain = require('../../domain');

var remote = require( '../../js/lib/remote' ),

wLib = require(  '../lib/widgetLib' ),

debug = require( 'debug' ),

baseConfig = require( './config.js' ),

history = require( './history' ),

mapLib = require( '../../js/lib/osm.maps' ),

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

  enabled = false,

  map,

  popup, popupMarker,

  frozenAuto = false,

  state,

  useClusters = false,

  clusterGroup = false,

  initCluster = false, // for clearing cluster at first enable

  boundsQueue = [],

  processingQueue = false;

  return (async () => {
    const attributes = attributeValues.get(elem);
    state = loadInitialState(attributes);
    applyLeafletStylesheet();

    log = debug(`map widget`);

    log('initializing %j', state);

    controller = options.register( wLib.interface('map', state.uid, {
      enable : enable,
      disable : disable,
      clear : clear,
      change : change,
      include : include,
      setOnBoundsChange : setOnBoundsChange
    }));

    const getControlData = promisify(cb => controller.getControlData(data => cb(null, data)));

    if (state.explicitInitialPosition) {
      map = await createMap();
    }

    const data = await getControlData();

    loadInitialState.fromControlData(state, data);

    log('control data fetched, state updated %j', state);

    _initLocations(data);

    if (state.focusOnEventUid) {
      const locationUid = getEventLocationUid(data, state.focusOnEventUid);
      state.center = locations[locationUid]?.coords;
      state.explicitInitialPosition = true;
      log('focusing on ', state.center);
    }

    if (!state.center) {
      const firstLocationUid = Object.keys(locations).shift();
      state.center = locations[firstLocationUid].coords;
    }

    log( 'init complete, enable to render' );

    map = await createMap();

    if (baseBounds === undefined) {
      _defineBaseBounds(data);
    }

    _bindAutoRefresh(state);

    _boundsChangeBehavior(state);

    _setMapToBaseBounds();

    _initMarkers(state);

    controller.onWidgetReady('map', {
      uid: state.uid
    });

    if ( onReady ) onReady();

  })();


  function _initMarkers(state) {

    var markers = [];

    useClusters = utils.size( locations ) > config.clusterThreshold;

    useClusters = true;

    for ( var l in locations ) {

      var location = locations[ l ];

      location.marker = m.createMarker( useClusters ? false : map, {
        position: location.coords,
        icon: state.icons.inactive.icon,
        anchor: state.icons.inactive.anchor
      } );

      markers.push( location.marker );

      _setOnMarkerClick(state, location);

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
    log('resetClusterController');

    var current = navHistory.get();

    if ( current.uid !== reqParams.uid ) {
      log('  event has been opened or closed');

      // if there is a change in opened event,
      // cluster must be reset only if markerCount changed
      if ( clusterGroup.markerCount < activeLocations.length ) {
        log('  markers count has changed, should reset (group: %s, active locations: %s)', clusterGroup.markerCount, activeLocations.length);
        return true;
      }
    } else {
      log('  event has not been opened or closed');

      // if is not a map filter change, reset cluster
      if ( _nonMapQueryChange( reqParams ) ) {
        log('  filters unrelated to map have changed, should reset');
        return true;
      }
    }


    if (current.neLat !== reqParams.neLat) return true;
    if (current.neLng !== reqParams.neLng) return true;
    if (current.swLat !== reqParams.swLat) return true;
    if (current.swLng !== reqParams.swLng) return true;

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

    log('enable with %j', reqParams);

    enabled = true;

    log('  defining bounds from navigation history and update');

    if ( navHistory.matchCurrent( reqParams ) ) {

      log('  history implies no new change. Bounds do not move');

      bounds = false;

    } else if ( navHistory.matchPrev( reqParams ) ) {

      log('  nav update shows history back. Moving bounds to previous state');

      bounds = navHistory.back();

    } else if ( reqParams.neLat && navHistory.current() ) {

      log('  nav update includes bound definition. Bounds do not change');

      bounds = false;

      navHistory.add( reqParams, navHistory.current() );

    } else if (state.enablesCount === 0 && state.explicitInitialPosition) {

      bounds = false;

    } else if (state.enablesCount === 0 && ( !utils.size( reqParams ) || _hasOnlyPassedParams( reqParams ) ) ) {

      log('  nav is init nav, no params are set or only passed events exist');

      bounds = baseBounds;

      navHistory.add( reqParams, bounds );

    } else if ( reqParams.uid ) {

      log('  nav update includes event selection. Bounds are defined around event');

      bounds = m.createBounds( locations[ activeLocations[ 0 ] ].coords );

      navHistory.add( reqParams, bounds );

    } else if ( activeBounds ) {

      log('  query params changed without geodata bounds are of active marker');

      // query params have changed and DO NOT contain geographical
      // parts. bounds should be that of the active markers
      bounds = activeBounds;

      navHistory.add( reqParams, bounds );

    } else {

      navHistory.add( reqParams, bounds );

    }

    state.enablesCount++;

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
        icon: state.icons.inactive.icon,
        anchor: state.icons.inactive.anchor
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
    log('include: event %s with location %s', eventItem.u, eventItem?.l);

    if (activeLocations.indexOf(eventItem?.l) !== -1) {
      log('  location not in active locations');
      return;
    }

    if (!eventItem.l || !locations[eventItem.l]) {
      log(  'location not in referenced locations');
      return;
    }

    log('  adding to active locations');
    activeLocations.push(eventItem.l);

    if (eventItem.passed) {
      passedLocations.push(eventItem.l);
    }

    locations[eventItem.l].count += 1;

    _includeInActiveBounds(locations[eventItem.l]);
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

    if (state.embedMode && ( window.env !== 'tpl' )) {

      return false;

    }

    return true;

  }


  function _setOnMarkerClick(state, location) {

    m.setOnMarkerClick( location.marker, function() {

      var updatedReqParams = {};

      log( 'clicked marker of location "%s"', location.uid );

      if ( !useClusters ) {

        // if there are neighbors, redefine bounds

        var neighborhoodBounds = _getNeighborBounds( location );


        if ( neighborhoodBounds ) {

          return ( state.auto ? _selectBounds : _fitBounds )( neighborhoodBounds, true );

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

    log('refreshing map: %s with %s active locations', enabled ? 'enabled' : 'not enabled', activeLocations?.length);

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


    activeLocations.forEach(l => {
      markers.push( _refreshMarker(locations[l]));
    });

    if (enabled && useClusters && clusterGroup && resetCluster) {
      _addClusterLayers(clusterGroup, markers);

      clusterGroup.markerCount = activeLocations.length;
    }

  }

  function _addClusterLayers( clusterGroup, markers ) {
    log('addClusterLayers with %s markers', markers?.length || 0);

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


  function _refreshMarker(location) {
    const active = (enabled && (activeLocations.indexOf(location.uid) !== -1));

    log('refreshMarker of location %s - %s (in %s mode)', location.uid, active ? 'active' : 'inactive', enabled ? 'enabled' : 'disabled');

    m.setMarkerIcon(location.marker, state.icons[active ? 'active' : 'inactive']);

    m.setMarkerZIndex(location.marker, active ? 1000 : -1000);

    // for count display of marker cluster
    location.marker.options.count = active ? 1 : 0;

    return location.marker;
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


  function _defineBaseBounds( data ) {

    var mode = 'all';

    if (data.ebd && data.ebd.mp) mode = data.ebd.mp;

    if ( ( mode === 'manual' ) && data.ebd && ( typeof data.ebd.mc === 'string' ) ) {

      const embedBounds = data.ebd.mc.split( '|' );

      return _initManualBounds( {
        neLat: embedBounds[ 0 ],
        neLng: embedBounds[ 1 ],
        swLat: embedBounds[ 2 ],
        swLng: embedBounds[ 3 ]
      } );

    } else if ( ( mode === 'manual' ) && data.ebd && data.ebd.mc && data.ebd.mc.neLat ) {

      return _initManualBounds( data.ebd.mc );

    } else {

      _initAllInclusiveBounds( data.p );

    }

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

    log('defining base bounds');
    for (const locationUid in locations) {
      const location = locations[locationUid];
      if (!isPassed && location.passed) {
        continue;
      }
      if (baseBounds === undefined) {
        baseBounds = m.createBounds(location.coords);
      } else {
        m.extendBounds(baseBounds, location.coords);
      }
    }

    if (baseBounds === undefined) {
      const firstLocationUid = Object.keys(locations).shift();
      if (!firstLocationUid) {
        return;
      }
      baseBounds = m.createBounds(locations[firstLocationUid].coords);
    }
  }



  async function createMap() {
    log('createMap');

    if (map) {
      log('map is already created');
      return;
    }

    m = mapLib({
      url: state.tiles
    });

    if (state.applyDefaultStyle) {
      styler(style);
    }

    const div = document.createElement( 'div' );

    div.innerHTML = templates.main({
      labels : config.labels[state.lang]
    } );

    if (du.el(elem, SYNC_SECTION_SELECTOR)) {
      div.removeChild(du.el(div, SYNC_SECTION_SELECTOR));
      div.appendChild(du.el( elem, SYNC_SECTION_SELECTOR));
    }

    elem.innerHTML = div.innerHTML;

    const createMap = promisify((elem, options, cb) => {
      m.createMap(elem, {
        ...options,
        onReady: newMap => cb(null, newMap)
      });
    });

    const map = await createMap(du.el(elem, 'div'), {
      center: state.center,
      zoom: state.zoom
    });

    if (state.explicitInitialPosition) {
      baseBounds = m.getBounds(map);
    }

    return map;
  }

  function _boundsChangeBehavior(state) {

    m.setOnBoundsChangeEnd( map, function() {

      navHistory.sync( m.getBounds( map ) );

      if ( selectedEvent ) return;

      log('bounds changed, automatic marker selection is %s and widget is %s', state.auto ? 'on' : 'off', enabled ? 'enabled' : 'disabled');

      if (enabled && state.auto && !frozenAuto) {

        _selectBounds();

      }

      if (onBoundsChangeCallback) {

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


  function _bindAutoRefresh(state) {

    if (state.auto) {
      du.el( elem, config.selectors.sync ).checked = true;
    }

    du.addEvent( du.el( elem, config.selectors.sync ), 'change', function( e ) {

      state.auto = !state.auto;

      log( 'sync of bounds filter with moving map: %s', state.auto ? 'on' : 'off' );

      if ( state.auto ) {

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
