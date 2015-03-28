exports.setOnReady = setOnReady;

var UID = 0,

LANG = 1,

cn = require(  '../../js/lib/common/common.mod.js' ),

EJS = require( '../../js/lib/clientEjs/ejs' ),

wLib = require(  '../lib/widgetLib' ),

debug = require( 'debug' ),

baseConfig = require( './config.js' ),

mapLib = require( '../../js/lib/maps/osm.maps.mod' ),

templates = {
  main: require( './main.ejs' ),
  popup: require( './popup.ejs' )
},

style = require( './style.css' ),

styler = require( '../lib/widgetStyler' ),

onReady; // cb to call when a widget is ready

if ( cn.contains( [ 'tpl', 'dev' ], window.env ) ) debug.enable( '*' );

var widget = function( elem, options ) {

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

  currentBounds,

  passedLocations = [],

  onBoundsChangeCallback,

  enabled = false,

  map,

  popup,

  embedMode,

  init = function() {

    var uid = options.anchorConfig[ UID ];

    log = debug( 'map widget ' + uid );

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

    controller.getControlData( function( data ) {
      
      log( 'control data fetched' );

      if ( !data.ebd || data.ebd.dcss ) styler( style );

      _initTiles( data );

      _initSettings( options.anchorConfig );

      _initLocations( data );

      _initIcons( data );

      _defineBaseBounds( data );

      log( 'init complete, enable to render' );

      _createMap( function() {

        log( 'created map' );

        _bindSync();

        _boundsChangeBehavior();

        _setMapToBaseBounds();

        _initMarkers();

        _initAutoSync( data );

        if ( onReady ) onReady();

      } );


    } );

    
  },

  _initMarkers = function() {

    for ( var l in locations ) {

      var location = locations[l];

      location.marker = m.createMarker( map, {
        position: location.coords,
        icon: config.icons.inactive.icon,
        anchor: config.icons.inactive.anchor
      } );

      _setOnMarkerClick( location );

      _refreshMarker( location );
    }

  },

  enable = function( reqParams ) {

    log( 'enabling map' );

    enabled = true;

  
    _updateBounds( reqParams, function( ) {

      if ( !reqParams.location ) {

        log( 'no location is set in request' );

        selectedLocation = false;

        if ( popup ) {

          m.removePopup( popup );

        }

      }

      selectedEvent = reqParams.uid ? reqParams.uid : false;

      if ( selectedEvent && activeLocations.length ) {

        _openPopup( locations[ activeLocations[ 0 ] ] );

      } else if ( reqParams.location ) {

        selectedLocation = locations[ reqParams.location ];

        _openPopup( selectedLocation );

      }

      _refresh();

    } );

  },

  _openPopup = function( l ) {

    _closePopup();

    popup = m.createPopup( map, new EJS({ text: templates.popup }).render( cn.extend({labels: config.labels[ config.lang ]}, l )), { marker: l.marker });

  },

  _closePopup = function() {

    if ( popup ) {

      m.removePopup( popup );

      popup = false;

    }

  },

  disable = function() {

    log( 'disabling' );

    enabled = false;

    _refresh();

  },

  clear = function() {

    activeLocations = [];

    passedLocations = [];

    activeBounds = false;

    if ( popup ) m.removePopup( popup );

    for ( var l in locations ) {

      locations[l].count = 0;
    
    }

  },


  /**
   * other widget is changing things,
   * clear own bounds
   */

  change = function() {

    currentBounds = false;

  },


  include = function( eventItem, reqParams ) {

    for ( var l in eventItem.l ) {

      if ( cn.contains( activeLocations, l ) ) {

        return;

      }

      // testing from reqParams is needed only because
      // of multiple locations per event.
      if ( !reqParams.neLat || _isIn( locations[ l ], reqParams ) ) {

        activeLocations.push( l );

        if ( eventItem.passed ) {

          passedLocations.push( l );

        }

        locations[l].count += 1;

        _includeInActiveBounds( locations[l] );

      }

    }

  },

  _includeInActiveBounds = function( location ) {

    if ( !activeBounds ) {

      activeBounds = m.createBounds( location.coords );

    } else {

      m.extendBounds( activeBounds, location.coords );

    }

  },

  _setOnMarkerClick = function( location ) {

    m.setOnMarkerClick( location.marker, function() {

      var updatedReqParams = {};

      log( 'clicked marker of location "%s"', location.placename );

      // if there are neighbors, redefine bounds

      var neighborhoodBounds = _getNeighborBounds( location );


      if ( neighborhoodBounds ) {

        return ( config.auto ? _selectBounds : _fitBounds )( neighborhoodBounds, true );

      }

      
      if ( !selectedLocation && !cn.contains( activeLocations, location.slug ) ) {

        // if location is not in active locactions,
        // clicking it will cancel current selection

        updatedReqParams = _setLocationParams( location.slug, true );

      } else if ( selectedLocation && ( selectedLocation.slug == location.slug ) ) {

        // if location is in part of current selection,
        // clicking it will remove it

        updatedReqParams = _unsetLocationParams();

      } else {

        // if location is not selected,
        // add it to current selection

        updatedReqParams = _setLocationParams( location.slug );

      }

      if ( cn.contains( passedLocations, location.slug ) ) {

        updatedReqParams.passed = '1';

      }

      _update( updatedReqParams );

    });
  },

  _unsetLocationParams = function() {

    return { location: null, neLat: null, neLng: null, swLat: null, swLng: null };

  },

  _setLocationParams = function( slug, clear ) {

    var updateValues = {
      neLat: null,
      neLng: null,
      swLat: null,
      swLng: null,
      location: slug
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

  },

  _refresh = function() {

    log( 'refreshing map: %s', enabled ? 'enabled' : 'not enabled' );

    if ( selectedLocation ) {
          
      activeLocations = [ selectedLocation.slug ];

      m.setCenter( map, selectedLocation.coords );

    }

    for ( var l in locations ) {
      
      _refreshMarker( locations[ l ] );
    
    }

  },


  setOnBoundsChange = function( cb ) {

    log( 'setting onboundschange callback' );
        
    onBoundsChangeCallback = cb;

  },


  _refreshMarker = function( location ) {

    var active = ( enabled && cn.contains( activeLocations, location.slug ) );

    m.setMarkerIcon( location.marker, config.icons[ active ? 'active' : 'inactive' ] );

    m.setMarkerZIndex( location.marker, active ? 1000 : -1000 );

  },


  _initTiles = function( data ) {

    if ( !data.ebd || !data.ebd.mt ) {

      log( 'tiles configuration not set' );

      return;

    }

    config.tiles = data.ebd.mt;

  },



   // initialize map object

  _initSettings = function( anchorConfig ) {

    if ( anchorConfig.length > 1 ) {

      config.lang = anchorConfig[LANG];

    }

    if ( elem.hasAttribute( 'data-lang' ) )
    {
      config.lang = elem.getAttribute( 'data-lang' );
    }

    log( 'using osm with tiles %s', config.tiles );

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

    m = mapLib( { url: config.tiles });

  },


  _initLocations = function( data ) {

    var today = new Date();

    today = today.getFullYear() + '-' + _fZ( today.getMonth() + 1 ) + '-' + _fZ( today.getDate() );

    for ( var a in data.a ) {

      for ( var l in data.a[a].l ) {

        if ( typeof locations[l] == 'undefined' ) {

          locations[ l ] = {
            placename: data.a[a].l[l].p,
            city: data.a[a].l[l].ct,
            address: data.a[a].l[l].a,
            slug: l,
            coords: [ data.a[a].l[l].lt, data.a[a].l[l].lg ],
            passed: true
          };

        }

        if ( !data.passed ) {

          for( var d in data.a[ a ].l[ l ].d ) {

            if ( data.a[ a ].l[ l ].d[ d ] >= today ) {

              locations[ l ].passed = false;

              break;              

            }

          }

        }

      }

    }

  },


  _initIcons = function( data ) {

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

  },


  _defineBaseBounds = function( data ) {

    var mode = 'all';

    if (data.ebd && data.ebd.mp) mode = data.ebd.mp;

    if ( ( mode == 'manual' ) && data.ebd.mc && data.ebd.mc.neLat ) {

      return _initManualBounds( data.ebd.mc );

    } else {

      _initAllInclusiveBounds( data.p );

    }

  },

  _initAutoSync = function( data ) {

    var auto = false;

    if ( data.ebd && data.ebd.ma ) auto = data.ebd.ma;

    config.auto = auto;

    if ( config.auto ) _activateSync();

  },

  _initManualBounds = function( corners ) {

    baseBounds = m.createBounds( [ corners.neLat, corners.neLng ] );

    m.extendBounds( baseBounds, [ corners.swLat, corners.swLng ] );

  },


  
  // define initial bounds to have them include all upcoming
  // markers. Or all markers if agenda is fully passed

  _initAllInclusiveBounds = function( isPassed ) {

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

          baseBounds = m.createBounds( locations[l].coords );

        } else {

          m.extendBounds( baseBounds, locations[l].coords );

        }

      }

    }


    // if bounds is still not defined, just pick first location
    
    if ( typeof baseBounds == 'undefined' ) {

      for ( l in locations ) break;

      baseBounds = m.createBounds( locations[l].coords );

    }

  },


  _createMap = function( cb ) {

    elem.innerHTML = new EJS( {text: templates.main } ).render( {
      labels : config.labels[ config.lang ]
    } );

    var center = [ 48.8705187,2.3821144 ];

    if ( cn.size( locations ) ) {
      
      for ( var s in locations ) break;

      center = locations[ s ].coords;

    }

    m.createMap( cn.el( elem, 'div'), { center: center, onReady: function( newMap ) {

      map = newMap;

      cb();

    }});

  },

  _boundsChangeBehavior = function() {

    m.setOnBoundsChangeEnd( map, function() {

      if ( selectedEvent ) return;

      log( 'bounds changed, automatic marker selection is %s and widget is %s', config.auto ? 'on' : 'off', enabled ? 'enabled' : 'disabled' );

      if ( enabled && config.auto ) {

        _selectBounds();

      }

      if ( onBoundsChangeCallback ) {

        log( 'giving bounds to onChangeCallback' );

        onBoundsChangeCallback( _getBoundParams() );

      }

    });

  },

  _getBoundParams = function( bounds ) {

    if ( typeof bounds == 'undefined' ) {

      bounds = m.getBounds( map );

    }

    var ne = m.getBoundsNorthEast( bounds ),

    sw = m.getBoundsSouthWest( bounds );

    return { neLat: ne[0], neLng: ne[1], swLat: sw[0], swLng: sw[1] };

  },

  _selectBounds = function( bounds, updateMap ) {

    log( 'selecting bounds' );

    if ( typeof updateMap == 'undefined' ) updateMap = false;

    _update( cn.extend({ location: null }, _getBoundParams( bounds ) ) );

    if ( updateMap ) {

      _fitBounds( bounds, true );

    }

  },

  _update = function( params ) {

    controller.update( 'map', params );

  },


  _updateBounds = function( reqParams, cb ) {

    var auto = config.auto,

    bounds;


    if ( currentBounds ) {

      return cb();

    }

    if ( !cn.size( reqParams ) ) {

      bounds = baseBounds;

    }

    if ( !bounds && ( ( cn.size( reqParams ) == 1 ) && reqParams.passed ) ) {

      bounds = baseBounds

    }

    if ( !bounds ) { 

      bounds = activeBounds;

    }

    if ( !bounds && !reqParams.location ) {

      bounds = baseBounds;

    }


    // carry out the repositionning

    config.auto = false;

    // the leaflet api pretends things are synchronous. They are not.
    setTimeout( function() {

      _fitBounds( bounds, true );

      // takes a while for map to adjust
      
      setTimeout(function() {

        config.auto = auto;

        return cb ? cb() : null;

      }, 500);

    }, 100 );

  },

  // default bounds encapsulate all the locations
  
  _setMapToBaseBounds = function() {

    log( 'setting map to base bounds: %s', JSON.stringify( baseBounds ) );

    baseBounds;
    
    _fitBounds( baseBounds );

  },

  _fitBounds = function( bounds, ignoreZoomLimit ) {

    if ( typeof ignoreZoomLimit == 'undefined' ) {

      ignoreZoomLimit = false;

    }

    m.fitBounds( map, bounds );

    currentBounds = bounds;

    log( 'prevent map to exceed min zoom' );

    if ( !ignoreZoomLimit && ( m.getZoom( map ) < config.minZoom ) ) {

      m.setZoom( map, config.minZoom );

    }

  },

  _bindSync = function() {

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

  },

  _deactivateSync = function() {

    config.auto = false;

    cn.el( elem, config.selectors.sync ).checked = false;

  },

  _activateSync = function() {

    cn.el( elem, config.selectors.sync ).checked = true;

    config.auto = true;

  }


  _getNeighborBounds = function( location ) {

    log( 'defining neighborhood bounds of location %s', location.placename );

    var bounds = false, nCount = 0,

    distanceThreshold = config.zoomToDistance[ m.getZoom( map ) ];

    log( 'distance threshold is set at %d', distanceThreshold );

    for ( var l in locations ) {

      // is this is a neighbor?
      if ( ( l !== location.slug ) && _distance( locations[l].coords[0], locations[l].coords[1], location.coords[0], location.coords[1]) < distanceThreshold ) {

        nCount++;

        if ( !bounds ) bounds = m.createBounds( location.coords );

        m.extendBounds( bounds, locations[l].coords );

      }

    }

    log( 'found %d neighbors', nCount );

    return bounds;
    
  },


  _distance = function( lat1, lon1, lat2, lon2 ) {
  
    var radlat1 = Math.PI * lat1 / 180,
    
    radlat2 = Math.PI * lat2 / 180,
    
    radlon1 = Math.PI * lon1 / 180,
    
    radlon2 = Math.PI * lon2 / 80,
    
    radtheta = Math.PI * (lon1-lon2)/180;
    
    return 60 * 1.1515 * 1609.344 * 180/Math.PI * Math.acos(Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta));

  };

  init();

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