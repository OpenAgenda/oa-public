"use strict";

exports.setOnReady = setOnReady;

var UID = 0, SUBSET = 1, MODE = 2,

cn = require(  '../../js/lib/common/common.mod.js' ),

wLib = require(  '../lib/widgetLib' ),

debug = require( 'debug' ),

dom = require( './dom.js' ),

onReady;

if ( cn.contains( [ 'tpl', 'development' ], window.env ) ) debug.enable( '*' );

function widget( elem, options ) {

  var log,

  view = dom( elem ),

  controller,

  enabled = false,

  selectedTag = false,

  tags = [], tagSlugs = [],

  requestTags = [], // tags which are in current request state

  activeTags = {},  // tags which are within current event selection

  passedTagSlugs = [];

  ( function() {

    if ( typeof options.anchorConfig === 'undefined' ) {

      console.log( 'tags widget configuration not found.' );

      return;

    }

    var uid = options.anchorConfig[ UID ];

    log = debug( 'tags widget ' + uid );

    log( 'initing' );

    controller = options.register( wLib.interface( 'tags', uid, {
      enable : enable,
      disable : disable,
      clear : clear,
      include : include,
    } ) );

    if ( options.anchorConfig[ MODE ] ) {

      view.setMode( options.anchorConfig[ MODE ] );

    }

    view.setOnSelect( _onTagSelect );

    view.setOnUnselect( _onTagUnselect );

    controller.getControlData( function( data ) {

      log( 'fetched controller data' );

      _setTags( data, options.anchorConfig );

      if ( !data.ebd || data.ebd.dcss.tags ) view.setDefaultStyle();

      log( 'init complete, enable to render' );

      if ( onReady ) onReady();

    } );


  } )()

  function enable( reqParams ) {

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

  }

  function clear() {
    
    log( 'clearing, awaiting enable or disable to render' );

    activeTags = {};
    passedTagSlugs = [];
    selectedTag = false;
    requestTags = false;

  }


  /**
   * include event tags in active tag set
   */
  
  function include( eventItem ) {

    if ( eventItem.t && eventItem.t.length ) {

      cn.forEach( eventItem.t, function( eventTag ) {

        if ( !cn.contains( tagSlugs, eventTag ) ) {

          return;

        }

        if ( typeof activeTags[ eventTag ] == 'undefined' ) {

          activeTags[ eventTag ] = 0;

        }

        activeTags[ eventTag ]++;

        if ( eventItem.passed ) {

          // add eventual eventTag to passedTagSlugs
          if ( !cn.contains( passedTagSlugs, eventTag ) ) passedTagSlugs.push( eventTag );

        } else {

          let passedTagIndex = passedTagSlugs.indexOf( eventTag );

          if ( passedTagIndex !== -1 ) {

            passedTagSlugs.splice( passedTagIndex, 1 );

          }

        }

      } );

    }

  }

  function disable() {

    enabled = false;

    _render();

  }

  function _onTagSelect( tag ) {

    log( 'selected %s with slug %s', tag.label, tag.slug );

    _clearWidgetRequestTags();

    requestTags.push( tag.slug );

    _update();

  }

  function _clearWidgetRequestTags() {

    cn.forEach( tags, function( tag ) {

      var i = _findIndex( requestTags, tag.s );

      if ( i !== -1 ) {

        requestTags.splice( i, 1 );

      }

    } );

  }

  function _findIndex( arr, val ) {

    var index = -1;

    for ( var i = 0; i<arr.length; i++ ) {

      if ( arr[ i ] === val ) {
        
        index = i;
        break;
        
      }

    }

    return index;

  }

  function _onTagUnselect( tag ) {

    log( 'unselected %s with slug %s', tag.label, tag.slug );

    requestTags.splice( _findIndex( requestTags, tag.slug ), 1 );

    _update();

  }

  function _update() {

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

  }


  /**
   * define widget tags set
   */

  function _setTags( data, config ) {

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

  }


  function _render() {

    log( 'rendering a%s widget', enabled ? 'n enabled' : ' disabled' );

    var data = {
      enabled : enabled,
      tags : []
    }, 

    previousGroup = 0;

    cn.forEach( tags, function( tag ) {

      var count = ( typeof activeTags[ tag.s ] == 'undefined' ? 0 : activeTags[ tag.s ] );

      var classes = [ 'oa-tag-' + tag.s ],

      active = enabled && count,

      selected = selectedTag == tag.s;

      if ( active ) classes.push( 'active' );

      if ( selected ) classes.push( 'selected' );

      if ( !count ) classes.push( 'no-current-match' );

      if ( typeof tag.g !== 'undefined' ) {

        if ( tag.g !== previousGroup ) {

          classes.push( 'oa-group-first-tag' );

        }

        previousGroup = tag.g;

      }

      data.tags.push( {
        label : tag.t,
        slug : tag.s,
        classes : ' ' + classes.join( ' ' ),
        selected : selected,
        count: count
      } );

    });

    view.render( data );

  }

}

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

require( '../lib/loader' )( {
  selector: '.cbpgtg',
  widget: widget,
  backup: {
    selector: '[data-oatg]',
    classNames: 'cibulTags'
  }
} );