"use strict";

const getLabel = require( '@openagenda/labels/makeLabelGetter' )( Object.assign(
  require( '@openagenda/labels/agendas/activeFilters' ),
  require( '@openagenda/labels/agendas/datetime' )
) );

const months = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december'
];

exports.setOnReady = setOnReady;

var UID = 0, LANG = 1, MODE = 2,

cn = require(  '../../js/lib/common' ),

wLib = require(  '../lib/widgetLib' ),

debug = require( 'debug' ),

domLib = require( './dom' ),

onReady;

if ( ['tpl', 'development'].indexOf( window.env ) !== -1 ) {

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

    lang = options.anchorConfig[ LANG ];

    var uid = options.anchorConfig[ UID ],

    log = debug( 'activeFilters widget ' + uid + ', lang ' + lang );

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
        type: 'geo',
        label: getLabel( 'map', lang ),
        keys: [ 'neLat', 'neLng', 'swLat', 'swLng' ]
      });

    }

    if ( reqParams.from ) {

      if ( reqParams.to && ( reqParams.to !== reqParams.from )) {

        newFilters.push({
          type: 'time',
          label: renderLabel( reqParams.from, reqParams.to ),
          keys: [ 'from', 'to' ]
        });

      } else {

        newFilters.push({
          type: 'time',
          label: renderLabel( reqParams.from ),
          keys: [ 'from', 'to' ]
        });

      }

    }

    if ( reqParams.what ) {

      newFilters.push({
        type: 'search',
        label: reqParams.what,
        keys: [ 'what' ]
      });

    }

    if ( reqParams.category ) {

      newFilters.push({
        type: 'category',
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
        type: 'tags',
        label: tagLabels.join( ', ' ),
        keys: [ 'tags' ]
      });

    }

    if ( reqParams.location ) {

      newFilters.push({
        type: 'geo',
        label: getLabel( 'location', lang ),
        keys: [ 'location' ]
      });

    }

    if ( reqParams.org ) {

      newFilters.push({
        type: 'contributor',
        label: organizations[ reqParams.org ],
        keys: [ 'org' ]
      });

    }

    if ( !!parseInt( reqParams.passed ) ) {

      newFilters.push({
        type: 'time',
        label: getLabel( 'passed', lang ),
        keys: [ 'passed' ]
      });

    }

    activeFilters = newFilters;

    _render();

  }

  function _render() {

    dom.render({ filters: activeFilters, enabled });

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

  function renderLabel( start, end ) {

    if ( end ) {

      return getLabel( 'fromTo', { start, end }, lang );

    } else {

      return renderDate( start );

    }

  }

  function renderDate( d ) {

    let date = new Date( d ),

      now = new Date(),

      displayYear = date.getFullYear() !== now.getFullYear();

    return date.getDate() + ' ' + getLabel( months[ date.getMonth() ], lang ) + ( displayYear ? ' ' + date.getFullYear() : '' );

  }

}

function setOnReady( cb ) {

  onReady = cb;

}

require( '../lib/controllerLoader' )( function( register ) {

  wLib.forEachAnchor( '.cbpgft', { register: register }, widget );

} );
