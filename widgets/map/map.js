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

styler = require( '../lib/widgetStyler' );

if ( window.env == 'tpl' ) debug.enable( '*' );

var widget = function( elem, options ) {

  var log,

  m,

  config = cn.extend( {}, baseConfig ),

  controller,

  locations = {},

  // when map position bounds are reset, they are reset to this
  baseBounds,

  selectedBounds,

  selectedLocation,

  activeLocations,

  onBoundsChangeCallback,

  enabled = false,

  map,

  sendCount = 0,

  popup,

  init = function() {

    var uid = options.anchorConfig[ UID ];

    log = debug( 'map widget ' + uid );

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

      _createMap( function() {

        _setMapToBaseBounds();

        _initMarkers();

      });

      _bindSync();
            
      log( 'init complete, enable to render' );

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

    enabled = true;

    _updateBounds( reqParams );

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
    if (reqParams.uid || selectedLocation) {

      _deactivateSync();

    }

    if ( reqParams.location ) {

      selectedLocation = locations[ reqParams.location ];

      popup = m.createPopup( map, new EJS({ text: templates.popup }).render( cn.extend({labels: config.labels[ config.lang ]}, selectedLocation )), { marker: selectedLocation.marker });

    }

    if ( sendCount ) sendCount--;

    _refresh();

  },


  disable = function() {

    log( 'disabling' );

    enabled = false;

    _refresh();

  },


  clear = function() {

    activeLocations = [];

    if ( popup ) m.removePopup( popup );

    for ( var l in locations ) {

      locations[l].count = 0;
    
    }

  },


  include = function( eventItem ) {

    for ( var l in eventItem.l ) {

      if ( !cn.contains( activeLocations, l)) {

        activeLocations.push( l );

      }

      locations[l].count += 1;

    }

  },


  _setOnMarkerClick = function( location ) {

    m.setOnMarkerClick( location.marker, function() {

      log( 'clicked marker of location "%s"', location.placename );

      // if there are neighbors, redefine bounds

      var neighborhoodBounds = _getNeighborBounds( location );


      if ( neighborhoodBounds ) {

        return _selectBounds( neighborhoodBounds, true );

      }

      // there are no neighbords. select location as new filter

      if ( !selectedLocation && !cn.contains( activeLocations, location.slug ) ) return;

      selectedBounds = false;

      _deactivateSync();

      _update({ location: location.slug, neLat: null, neLng: null, swLat: null, swLng: null });

    });
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

    config.tiles = ctl.ebd.mt;

  },



   // initialize map object

  _initSettings = function( anchorConfig ) {

    if ( anchorConfig.length > 1 ) {

      config.lang = anchorConfig[LANG];

    }

    log( 'using osm with tiles %s', config.tiles );

    if (typeof document.createStyleSheet == "undefined") {

      cn.el('head').insertAdjacentHTML('beforeend', '<link rel="stylesheet" type="text/css" href="//s3-eu-west-1.amazonaws.com/cibulstatic/leaflet-0.6.4.css">');

    } else {

      document.createStyleSheet( config.leafletCss );
      document.createStyleSheet( config.leafletCssIE );

    }

    m = mapLib( { url: config.tiles });

  },


  _initLocations = function( data ) {

    for ( var a in data.a ) {

      for ( var l in data.a[a].l ) {

        if (typeof locations[l] == 'undefined') {

          locations[ l ] = {
            placename: data.a[a].l[l].p,
            city: data.a[a].l[l].ct,
            address: data.a[a].l[l].a,
            slug: l,
            coords: [ data.a[a].l[l].lt, data.a[a].l[l].lg ]
          };

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

      _initAllInclusiveBounds();

    }

  },


  initManualBounds = function( corners ) {

    baseBounds = m.createBounds( [ corners.neLat, corners.neLng ] );

    m.extendBounds( baseBounds, [ corners.swLat, corners.swLng ] );

  },


  
  // define initial bounds to have them include all markers

  _initAllInclusiveBounds = function() {

    if ( !cn.size( locations ) ) {

      log( 'no location is defined, cannot define bounds.' );

      return;

    }

    if (typeof baseBounds !== 'undefined') {

      log( 'adjusting map to base bounds' );

      m.fitBounds( map, baseBounds );

      return;

    }


    log( 'defining base bounds' );

    for ( var l in locations ) break;

    baseBounds = m.createBounds( locations[l].coords );

    for ( l in locations ) {

      m.extendBounds( baseBounds, locations[l].coords );

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

      m.setOnBoundsChangeEnd( map, function() {

        log( 'bounds changed, automatic marker selection is %s', config.auto ? 'on' : 'off' );

        if ( enabled && config.auto && !selectedLocation) {

          _selectBounds();

        }

        if ( onBoundsChangeCallback ) {

          log( 'giving bounds to onChangeCallback' );

          onBoundsChangeCallback( _getBoundParams() );

        }

      });

    }});

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

    selectedBounds = _getBoundParams( bounds );

    _update( cn.extend({ location: null }, selectedBounds ) );

    if ( updateMap ) m.fitBounds( map, bounds );

  },

  _update = function( params ) {

    sendCount++;

    controller.update( 'map', params );

  },


  // update map bounds

  _updateBounds = function( reqParams ) {

    log( 'updating map bounds' );

    if ( sendCount > 0 ) return;

    if ( !reqParams.neLat ) return;

    if ( _getBoundParams().neLat == reqParams.neLat ) {

      log( 'bounds are already set at request value' );

      return;

    }

    var auto = config.auto,

    bounds = m.createBounds( [ reqParams.neLat, reqParams.neLng ] );

    m.extendBounds( bounds, [ reqParams.swLat, reqParams.swLng ] );

    config.auto = false;

    m.fitBounds( map, bounds );

    // takes a while for map to adjust
    
    setTimeout(function() {

      config.auto = auto;

    }, 500);

  },

  // default bounds encapsulate all the locations
  
  _setMapToBaseBounds = function() {

    log( 'setting map to base bounds' );

    m.fitBounds( map, baseBounds );

  },

  _bindSync = function() {

    cn.addEvent( cn.el( elem, config.selectors.sync ), 'change', function( e ) {

      config.auto = !config.auto;

      if ( !selectedLocation ) {

        if ( config.auto ) {

          _selectBounds();

        } else {

          _update({ neLat: null, neLng: null, swLat: null, swLng: null, location: null });

        }

      }

    });

  },

  _deactivateSync = function() {

    config.auto = false;

    cn.el( elem, config.selectors.sync ).checked = false;

  },


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

require( '../lib/controllerLoader' )( function( register ) {

  wLib.forEachAnchor( '.cbpgmp', { register: register }, widget );

} );