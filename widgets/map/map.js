"use strict";

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

if ( ['tpl', 'dev'].indexOf( window.env ) !== -1 ) debug.enable( '*' );

function widget( elem, options ) {

  var log,

  m,

  config = cn.extend( {}, baseConfig ),

  controller,

  locations = {},

  // when map position bounds are reset, they are reset to this
  baseBounds,

  selectedBounds,

  selectedLocation,

  activeLocations = [],

  passedLocations = [],

  onBoundsChangeCallback,

  enabled = false,

  map,

  sendCount = 0,

  popup,

  embedMode,

  useClusters = false;

  return ( function() {

    var uid = options.anchorConfig[ UID ];

    log = debug( 'map widget ' + uid );

    embedMode = uid.split( '/' ).length == 2;

    log( 'initing' );

    controller = options.register( wLib.interface( 'map', uid, {
      enable : enable,
      disable : disable,
      clear : clear,
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

        if ( onReady ) onReady();

      } );


    } );

    
  } )();


  function _initMarkers() {

    var markers = [], clusterGroup;

    useClusters = cn.size( locations ) > config.clusterThreshold;

    for ( var l in locations ) {

      var location = locations[l];

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

      m.createCluster( map, markers );

    }

  }


  function enable( reqParams ) {

    log( 'enabling map' );

    enabled = true;

    _updateBounds( reqParams, function() {

      if ( !reqParams.location ) {

        log( 'no location is set in request' );

        selectedLocation = false;

      }

      // widget has active selection on bounds, its not set in received params
      if ( !reqParams.neLat && selectedBounds ) {

        log( 'bounds are not specified in request, keeping current bounds.' );

        selectedBounds = false;

        if ( !selectedLocation && !reqParams.uid ) {

          _setMapToBaseBounds();

        }

      }

      // received params have bounds defined but not map widget
      if ( reqParams.neLat && !selectedBounds ) {

        selectedBounds = {
          neLat: reqParams.neLat,
          neLng: reqParams.neLng,
          swLat: reqParams.swLat,
          swLng: reqParams.swLng
        };

      }

      // if a location is picked, or an event, deactivate selection when map is moved around
      if ( reqParams.uid || selectedLocation || !reqParams.neLat ) {

        _deactivateSync();

      } else {

        _activateSync();

      }

      if ( reqParams.location ) {

        selectedLocation = locations[ reqParams.location ];

        popup = m.createPopup( map, new EJS({ text: templates.popup }).render( cn.extend({labels: config.labels[ config.lang ]}, selectedLocation )), { marker: selectedLocation.marker });

      }

      if ( sendCount ) sendCount--;

      _refresh();

    } );

  }


  function disable() {

    log( 'disabling' );

    enabled = false;

    _refresh();

  }


  function clear() {

    activeLocations = [];

    passedLocations = [];

    if ( popup ) m.removePopup( popup );

    for ( var l in locations ) {

      locations[l].count = 0;
    
    }

  }


  function include( eventItem ) {

    for ( var l in eventItem.l ) {

      if ( cn.contains( activeLocations, l ) ) {

        return;

      }

      activeLocations.push( l );

      if ( eventItem.passed ) {

        passedLocations.push( l );

      }

      locations[l].count += 1;

    }

  }


  function _setOnMarkerClick( location ) {

    m.setOnMarkerClick( location.marker, function() {

      var updatedReqParams = {};

      log( 'clicked marker of location "%s"', location.placename );

      if ( !useClusters ) {

        // if there are neighbors, redefine bounds

        var neighborhoodBounds = _getNeighborBounds( location );


        if ( neighborhoodBounds ) {

          return ( config.auto ? _selectBounds : _fitBounds )( neighborhoodBounds, true );

        }


        // there are no neighbors. select location as new filter

        if ( !selectedLocation && !cn.contains( activeLocations, location.slug ) ) return;

        selectedBounds = false;

        _deactivateSync();


        if ( selectedLocation && ( selectedLocation.slug == location.slug ) ) {

          updatedReqParams = _unsetLocationParams();

        } else {

          updatedReqParams = _setLocationParams( location.slug );

        }


        if ( cn.contains( passedLocations, location.slug ) ) {

          updatedReqParams.passed = '1';

        }

        _update( updatedReqParams );

      }

    });

  },


  _unsetLocationParams = function() {

    return { location: null, neLat: null, neLng: null, swLat: null, swLng: null };

  },

  _setLocationParams = function( slug ) {

    return { location: slug, neLat: null, neLng: null, swLat: null, swLng: null };

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

  }


  function setOnBoundsChange( cb ) {

    log( 'setting onboundschange callback' );
        
    onBoundsChangeCallback = cb;

  }


  function _refreshMarker( location ) {

    var active = ( enabled && cn.contains( activeLocations, location.slug ) );

    m.setMarkerIcon( location.marker, config.icons[ active ? 'active' : 'inactive' ] );

    m.setMarkerZIndex( location.marker, active ? 1000 : -1000 );

  }


  function _initTiles( data ) {

    if ( !data.ebd || !data.ebd.mt ) {

      log( 'tiles configuration not set' );

      return;

    }

    config.tiles = data.ebd.mt;

  }



   // initialize map object

  function _initSettings( anchorConfig ) {

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

  }


  function _initLocations( data ) {

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

  }


  function _createMap( cb ) {

    var div = document.createElement( 'div' );

    div.innerHTML = new EJS( {text: templates.main } ).render( {
      labels : config.labels[ config.lang ]
    } );

    if ( cn.el( elem, config.selectors.syncSection ) ) {

      div.removeChild( cn.el( div, config.selectors.syncSection ) );

      div.appendChild( cn.el( elem, config.selectors.syncSection ) );

    }

    elem.innerHTML = div.innerHTML;

    var center = [ 48.8705187,2.3821144 ];

    if ( cn.size( locations ) ) {
      
      for ( var s in locations ) break;

      center = locations[ s ].coords;

    }

    m.createMap( cn.el( elem, 'div'), { center: center, onReady: function( newMap ) {

      map = newMap;

      cb();

    }});

  }


  function _boundsChangeBehavior() {

    m.setOnBoundsChangeEnd( map, function() {

      log( 'bounds changed, automatic marker selection is %s and widget is %s', config.auto ? 'on' : 'off', enabled ? 'enabled' : 'disabled' );

      if ( enabled && config.auto && !selectedLocation) {

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

    return { neLat: ne[0], neLng: ne[1], swLat: sw[0], swLng: sw[1] };

  }


  function _selectBounds( bounds, updateMap ) {

    log( 'selecting bounds' );

    if ( typeof updateMap == 'undefined' ) updateMap = false;

    selectedBounds = _getBoundParams( bounds );

    _update( cn.extend({ location: null }, selectedBounds ) );

    if ( updateMap ) {

      _fitBounds( bounds, true );

    }

  }


  function _update( params ) {

    sendCount++;

    controller.update( 'map', params );

  }


  // update map bounds

  function _updateBounds( reqParams, cb ) {

    log( 'updating map bounds to %s', JSON.stringify( reqParams ) );

    if ( sendCount > 0 ) return cb ? cb() : null;

    if ( !reqParams.neLat ) {

      _deactivateSync();

      return cb ? cb() : null;
      
    }

    if ( _getBoundParams().neLat == reqParams.neLat ) {

      log( 'bounds are already set at request value' );

      return cb ? cb() : null;

    }

    var auto = config.auto,

    bounds = m.createBounds( [ reqParams.neLat, reqParams.neLng ] );

    m.extendBounds( bounds, [ reqParams.swLat, reqParams.swLng ] );

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

  }

  
  // default bounds encapsulate all the locations
  function _setMapToBaseBounds() {

    log( 'setting map to base bounds: %s', JSON.stringify( baseBounds ) );
    
    _fitBounds( baseBounds );

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

      if ( !selectedLocation ) {

        if ( config.auto ) {

          _selectBounds();

        } else {

          _update({ neLat: null, neLng: null, swLat: null, swLng: null, location: null });

        }

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

function _fZ( n ) {
  return (n>9?'':'0') + n;
};


function setOnReady( cb ) {

  onReady = cb;

}


require( '../lib/controllerLoader' )( function( register ) {

  wLib.forEachAnchor( '.cbpgmp', { register: register }, widget );

} );