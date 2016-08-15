exports.setOnReady = setOnReady;

var UID = 0, LANG = 1, MODE = 2,

cn = require(  '../../js/lib/common/common.mod.js' ),

wLib = require(  '../lib/widgetLib' ),

debug = require( 'debug' ),

domLib = require( './dom' ),

config = require( './config' ),

dateLabels = require( './dateLabels' ),

onReady;

if ( ['tpl', 'dev'].indexOf( window.env ) !== -1 ) {

  debug.enable( '*' );

}

var widget = function( elem, options ) {

  var log,

  enabled = false,

  activeFilters = {},

  dom = domLib( elem ),

  lang = 'fr',

  categories = {},

  tags = {},

  organizations = {},

  controller;

  return ( function() {

    var uid = options.anchorConfig[ UID ],

    lang = options.anchorConfig[ LANG ],

    log = debug( 'activeFilters widget ' + uid );

    dateLabels.setLang( lang );

    if ( options.anchorConfig[ MODE ] ) {

      dom.setMode( options.anchorConfig[ MODE ] );

    }

    dom.setOnRemove( _onFilterRemove );

    log( 'initing' );

    controller = options.register( wLib.interface( 'activeFilters', uid, {
      enable : enable,
      disable : disable
    } ));

    controller.getControlData( function( data ) {

      _indexLabels( data );

      log( 'init complete, enable to render' );

      if ( onReady ) onReady();

    });

  } )();

  function disable() {

    enabled = false;

    _render();

  }

  function enable( reqParams ) {

    var newFilters = [], reqTags, tagLabels;

    enabled = true;

    if ( reqParams.neLat ) {

      newFilters.push({
        label: _label( 'map' ),
        keys: [ 'neLat', 'neLng', 'swLat', 'swLng' ]
      });

    }

    if ( reqParams.from ) {

      if ( reqParams.to && ( reqParams.to !== reqParams.from )) {

        newFilters.push({
          label: dateLabels( reqParams.from, reqParams.to ),
          keys: [ 'from', 'to' ]
        });

      } else {

        newFilters.push({
          label: dateLabels( reqParams.from ),
          keys: [ 'from', 'to' ]
        });

      }

    }

    if ( reqParams.what ) {

      newFilters.push({
        label: reqParams.what,
        keys: [ 'what' ]
      });

    }

    if ( reqParams.category ) {

      newFilters.push({
        label: categories[ reqParams.category ],
        keys: [ 'category' ]
      });

    }

    if ( reqParams.tags ) {

      reqTags = ( typeof reqParams.tags == 'string' ) ? [ reqParams.tags ] : reqParams.tags;

      tagLabels = [];

      cn.forEach( reqTags, function( tag ) {

        tagLabels.push( tags[ tag ] );

      });

      newFilters.push({
        label: tagLabels.join( ', ' ),
        keys: [ 'tags' ]
      });

    }

    if ( reqParams.location ) {

      newFilters.push({
        label: config.labels[ lang ].location,
        keys: [ 'location' ]
      });

    }

    if ( reqParams.org ) {

      newFilters.push({
        label: organizations[ reqParams.org ],
        keys: [ 'org' ]
      });

    }

    if ( !!parseInt( reqParams.passed ) ) {

      newFilters.push({
        label: config.labels[ lang ].passed,
        keys: [ 'passed' ]
      });

    }

    activeFilters = newFilters;

    _render();

  }

  function _render() {

    dom.render({ filters: activeFilters, enabled: enabled });

  }

  function _label( type, values ) {

    if ( typeof values == 'undefined' ) values = {};

    return _format( config.labels[ lang ][ type ], values );

  }

  function _format(tpl, ctx) {

    return tpl.replace(/\{\{([a-zA-Z ]*)\}\}/g, function(m, g) {
        return ctx[g.trim()] || '';
    });

  }

  function _indexLabels( data ) {

    cn.forEach( data.ct, function( c ) {

      categories[ c.s ] = c.c;

    } );

    cn.forEach( data.t, function( t ) {

      tags[ t.s ] = t.t;

    } );

    if ( data.org ) {

      cn.forEach( data.org, function( o ) {

        organizations[ o.s ] = o.l;

      } );

    }

  }

  function _onFilterRemove( filter ) {

    var keysToRemove = {};

    if ( !enabled ) {

      log( 'remove filter ignored, widget not enabled' );

      return;

    }

    cn.forEach( filter.keys, function( key ) {

      keysToRemove[ key ] = null;

    } );

    controller.update( 'activeFilters', keysToRemove );

  }

}

function setOnReady( cb ) {

  onReady = cb;

}

require( '../lib/controllerLoader' )( function( register ) {

  wLib.forEachAnchor( '.cbpgft', { register: register }, widget );

} );