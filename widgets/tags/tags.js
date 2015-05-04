"use strict";

exports.setOnReady = setOnReady;

var UID = 0, SUBSET = 1, MODE = 2,

cn = require(  '../../js/lib/common/common.mod.js' ),

wLib = require(  '../lib/widgetLib' ),

debug = require( 'debug' ),

dom = require( './dom.js' ),

onReady;

if ( cn.contains( [ 'tpl', 'dev' ], window.env ) ) debug.enable( '*' );

var widget = function( elem, options ) {

  var log,

  view = dom( elem ),

  controller,

  enabled = false,

  selectedTag = false,

  tags = [], tagSlugs = [],

  requestTags = [], // tags which are in current request state

  activeTags = {},  // tags which are within current event selection

  passedTagSlugs = [],

  init = function() {

    var uid = options.anchorConfig[ UID ];

    log = debug( 'tags widget ' + uid );

    log( 'initing' );

    controller = options.register( wLib.interface( 'tags', uid, {
      enable : enable,
      disable : disable,
      clear : clear,
      include : include,
    } ) );

    if ( options.anchorConfig[ MODE ] ) {

      view.setMode( options.anchorConfig[ MODE ] );

    }

    view.setOnSelect( _onTagSelect );

    view.setOnUnselect( _onTagUnselect );

    controller.getControlData( function( data ) {

      log( 'fetched controller data' );

      _setTags( data, options.anchorConfig );

      if ( !data.ebd || data.ebd.dcss ) view.setDefaultStyle();

      log( 'init complete, enable to render' );

      if ( onReady ) onReady();

    } );


  },

  enable = function( reqParams ) {

    enabled = true;

    log( 'enabling tag widget' );

    if ( typeof reqParams == 'undefined' ) reqParams = {};

    selectedTag = false;
    requestTags = [];
    
    if ( reqParams.tags ) {

      requestTags = ( typeof reqParams.tags == 'string' ) ? reqParams.tags.split(',') : reqParams.tags;

      // find which tag has been picked
      cn.forEach( requestTags, function( requestTag ) {

        if ( !selectedTag && cn.contains( tagSlugs, requestTag ) ) {

          selectedTag = requestTag;

        }

      });

    }

    _render();

  },

  clear = function() {
    
    log( 'clearing, awaiting enable or disable to render' );

    activeTags = {};
    passedTagSlugs = [];
    selectedTag = false;
    requestTags = false;

  },


  /**
   * include event tags in active tag set
   */
  
  include = function( eventItem ) {

    if ( eventItem.t && eventItem.t.length ) {

      cn.forEach( eventItem.t, function( eventTag ) {

        if ( !cn.contains( tagSlugs, eventTag ) ) {

          return;

        }

        if ( typeof activeTags[ eventTag ] == 'undefined' ) {

          activeTags[ eventTag ] = 0;

        }

        activeTags[ eventTag ]++;

        if ( eventItem.passed && !cn.contains( passedTagSlugs, eventTag ) ) {

          passedTagSlugs.push( eventTag );

        }

      } );

    }

  },

  disable = function() {

    enabled = false;

    _render();

  },

  _onTagSelect = function( tag ) {

    log( 'selected %s with slug %s', tag.label, tag.slug );

    _clearWidgetRequestTags();

    requestTags.push( tag.slug );

    _update();

  },

  _clearWidgetRequestTags = function() {

    cn.forEach( tags, function( tag ) {

      var i = _findIndex( requestTags, tag.s );

      if ( i !== -1 ) {

        requestTags.splice( i, 1 );

      }

    } );

  },

  _findIndex = function( arr, val ) {

    var index = -1;

    for ( var i = 0; i<arr.length; i++ ) {

      if ( arr[ i ] === val ) {
        
        index = i;
        break;
        
      }

    }

    return index;

  },

  _onTagUnselect = function( tag ) {

    log( 'unselected %s with slug %s', tag.label, tag.slug );

    requestTags.splice( _findIndex( requestTags, tag.slug ), 1 );

    _update();

  },

  _update = function() {

    var updatedRequestParams = { tags : requestTags.length ? requestTags.slice() : null },

    passed = false;

    cn.forEach( requestTags, function( reqTag ) {

      if ( cn.contains( passedTagSlugs, reqTag ) ) {

        passed = true;

      }

    });

    if ( passed ) {

      updatedRequestParams.passed = '1';

    }

    controller.update( 'tags', updatedRequestParams );

  },


  /**
   * define widget tags set
   */

  _setTags = function( data, config ) {

    var subset;

    log( 'defining widget tags' );

    if ( ( typeof config[ SUBSET ] !== 'undefined' ) && config[ SUBSET ].length ) {

      subset = config[ SUBSET ].split( ',' );

      cn.forEach( data.t, function( tag ) {

        if ( cn.contains( subset, tag.s ) ) tags.push( tag );

      } );

      tags = _order( tags, subset );

      cn.forEach( tags, function( t ) {

        tagSlugs.push( t.s );

      })

    } else {

      cn.forEach( data.t, function( tag ) {
        
        tags.push( tag );          

        tagSlugs.push( tag.s );

      } );

    }

    log( 'widget initialized with %s tags', tags.length );

  },

  _render = function() {

    log( 'rendering a%s widget', enabled ? 'n enabled' : ' disabled' );

    var data = {
      enabled : enabled,
      tags : []
    };

    cn.forEach( tags, function( tag ) {

      var count = ( typeof activeTags[ tag.s ] == 'undefined' ? 0 : activeTags[ tag.s ] );

      data.tags.push( {
        label : tag.t,
        slug : tag.s,
        active : enabled && count,
        selected : selectedTag == tag.s,
        count: count
      } );

    });

    view.render( data );

  };

  init();

};

function setOnReady( cb ) {

  onReady = cb;

}

function _order( tags, orderedSlugs ) {

  var ordered = [];

  orderedSlugs.forEach( function( s ) {

    tags.forEach( function( t ) {

      if ( t.s == s ) ordered.push( t );

    });

  });

  return ordered;

}


require( '../lib/controllerLoader' )( function( register ) {

  wLib.forEachAnchor( '.cbpgtg', { register: register }, widget );

} );