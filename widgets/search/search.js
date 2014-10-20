var UID = 0,

EJS = require( '../../js/lib/clientEjs/ejs' ),

cn = require(  '../../js/lib/common/common.mod.js' ),

wLib = require(  '../lib/widgetLib' ),

debug = require( 'debug' ),

baseConfig = require( './config.js' ),

template = require( './main.ejs' ),

style = require( './style.css' ),

styler = require( '../lib/widgetStyler' ),

handleSuggestions = require( '../../js/cibul/handleSuggestions/src/handleSuggestions.mod.js' ),

today = new Date();

if ( window.env == 'tpl' ) debug.enable( '*' );

var widget = function( elem, options ) {

  var enabled = false,

  config = cn.extend( {}, baseConfig ),

  controller,

  log,

  searchIndex = {}, // local search index

  searchSelection = false,

  init = function() {

    var uid = options.anchorConfig[ UID ];

    log = debug( 'search widget ' + uid );

    log( 'initing' );

    controller = options.register( wLib.interface( 'search', uid, {
      enable : enable,
      disable : disable
    } ) );

    controller.getControlData( function( data ) {

      _createIndex( data );

      if ( !data.ebd || data.ebd.dcss ) styler( style );

      _createElement();

      handleSuggestions( cn.el( elem, 'input' ), searchIndex, 'name', '<div><%= label %></div>', {
        contextMenuClass: config.classes.contextMenu,
        match: 'direct',
        onSelect: _update,
        filter: _clean,
        maxResults: 20
      });

    });

  },

  enable = function( reqParams ) {

    enabled = true;

    if ( reqParams.neLat ) {

      if (
        (reqParams.neLat == searchSelection.neLat) && 
        (reqParams.neLng == searchSelection.neLng) && 
        (reqParams.swLat == searchSelection.swLat) && 
        (reqParams.swLng == searchSelection.swLng) ) {

        log( 'search canvas does not change' );

        return;
    
      }

    }

    if ( reqParams.location && ( reqParams.location == searchSelection.location ) ) {
      
      log( 'search matches already selected location' );

    }

  },

  disable = function() {

    enabled = false;

  },

  _createIndex = function( data ) {

    log( 'creating index' );

    var locations = []; // keep track of processed locations

    for ( var a in data.a ) {

      for ( var l in data.a[a].l ) {

        if ( !cn.contains( locations, l ) ) {

          var location = data.a[a].l[ l ];

          locations.push( l );

          _indexItem( location.p, location, l );

          cn.forEach( [ 'pc', 'ct', 'rg', 'dp' ], function( key ) {

            _indexItem( location[ key ], location );

          } );

        }

      }

    }

    var tmp = searchIndex;

    searchIndex = [];

    for ( var name in tmp ) {

      var index = { name: name, label: tmp[name].label, score: tmp[name].score, corners: {ne: tmp[name].ne, sw: tmp[name].sw} };

      if (tmp[name]['id']) index['id'] = tmp[name]['id'];

      searchIndex.push(index);

    }

    searchIndex = searchIndex.sort(function( a, b ) { return b.score - a.score; });

    log( 'there are now %d items in search index', searchIndex.length );

  },

  _createElement = function() {

    elem.innerHTML = new EJS( { text : template } ).render( { labels : config.labels } );

  },

  _indexItem = function( name, location, id ) {

    if ( !name || !name.length ) {

      return;

    }

    var cleaned = _clean( name ),

    point = _hasUpcoming( location ) ? 1 : 0,

    coords = [ parseFloat( location.lt ), parseFloat( location.lg ) ];

    if ( typeof searchIndex[ cleaned ] == 'undefined' ) {

      log( 'creating entry in index for %s', cleaned );

      searchIndex[ cleaned ] = {
        ne: [ coords[0] + config.offset, coords[1] + config.offset ],
        sw: [ coords[0] - config.offset, coords[1] - config.offset ], 
        score: point,
        label: name
      };

      // if this is a place, keep track of id to throw it in the callback
      if ( id ) searchIndex[ cleaned ].id = id;

    } else {

      log( 'updating entry in index for %s', cleaned );

      if ( typeof searchIndex[cleaned].id !== id ) searchIndex[cleaned].id = undefined;

      if ( searchIndex[ cleaned ].ne[0] < coords[0]) searchIndex[ cleaned ].ne[0] = coords[0] + config.offset;
      if ( searchIndex[ cleaned ].ne[1] < coords[1]) searchIndex[ cleaned ].ne[1] = coords[1] + config.offset;
      if ( searchIndex[ cleaned ].sw[0] > coords[0]) searchIndex[ cleaned ].sw[0] = coords[0] - config.offset;
      if ( searchIndex[ cleaned ].sw[1] > coords[1]) searchIndex[ cleaned ].sw[1] = coords[1] - config.offset;

      searchIndex[ cleaned ].score += point;

    }

  },

  _clean = function( value ) {

    var clean = value.trim().toLowerCase();

    clean = clean.replace( /sain|sai|sa/g, 's' );

    clean = clean.replace( /[-'.,"]/g, ' ' );

    for( var i=0; i < config.diacritics.length; i++) {

      clean = clean.replace( config.diacritics[i].letters, config.diacritics[i].base );
    
    }

    log( 'cleaned value "%s" to "%s"', value, clean );

    return clean;

  },

  _update = function( value ) {

    if ( value.id ) {

      searchSelection = { 
        location: value.id,
        neLat: null,
        neLng: null,
        swLat: null,
        swLng: null
      };

    } else {

      searchSelection = {
        location: null,
        neLat: value.corners.ne[0],
        neLng: value.corners.ne[1],
        swLat: value.corners.sw[0],
        swLng: value.corners.sw[1]
      };

    }

    log( 'updating with %s', JSON.stringify( searchSelection ) );

    controller.update( 'search', searchSelection );

  },

  _hasUpcoming = function( l ) {

    for ( var i = l.d.length - 1; i >= 0; i-- ) {

      if ( new Date( l.d[i] ) > today ) {

        log( 'location %s has upcoming dates.', l.pl );

        return true;

      }

    }

    log( 'location %s does not have upcoming dates.', l.p );

    return false;

  };

  init();

};

require( '../lib/controllerLoader' )( function( register ) {

  wLib.forEachAnchor( '.cbpgsc', { register: register }, widget );

} );