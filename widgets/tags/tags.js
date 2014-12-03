exports.setOnReady = setOnReady;

var UID = 0, SUBSET = 1,

cn = require(  '../../js/lib/common/common.mod.js' ),

wLib = require(  '../lib/widgetLib' ),

debug = require( 'debug' ),

dom = require( './dom.js' ),

onReady;

if ( ['tpl', 'dev'].indexOf( window.env ) !== -1 ) debug.enable( '*' );


var widget = function( elem, options ) {

  var log,

  view = dom( elem ),

  controller,

  enabled = false,

  selectedTag = false,

  tags = [], tagSlugs = [],

  requestTags = [], // tags which are in current request state

  activeTags = [],  // tags which are within current event selection

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

    activeTags = [];
    selectedTag = false;
    requestTags = false;

  },


  /**
   * include event tags in active tag set
   */
  
  include = function( eventItem ) {

    if ( eventItem.t && eventItem.t.length ) {

      cn.forEach( eventItem.t, function( eventTag ) {

        if ( cn.contains( tagSlugs, eventTag ) && !cn.contains( activeTags, eventTag ) ) {

          activeTags.push( eventTag );

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

    if ( !cn.contains( activeTags, tag.slug ) ) {

      log( 'tag is not active. ignoring' );

      return;

    }

    requestTags.push( tag.slug );

    _update();

  },

  _onTagUnselect = function( tag ) {

    log( 'unselected %s with slug %s', tag.label, tag.slug );

    requestTags.splice( requestTags.indexOf( tag.slug ), 1 );

    _update();

  },

  _update = function() {

    controller.update( 'tags', { tags : requestTags.length ? requestTags : null } );

  },


  /**
   * define widget tags set
   */

  _setTags = function( data, config ) {

    var subset;

    log( 'defining widget tags' );

    if ( typeof config[ SUBSET ] !== 'undefined' ) {

      subset = config[ SUBSET ].split( ',' );

      cn.forEach( data.t, function( tag ) {

        if ( cn.contains( subset, tag.s ) ) {

          tags.push( tag );

          tagSlugs.push( tag.s );

        } 

      } );

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

      data.tags.push( {
        label : tag.t,
        slug : tag.s,
        active : enabled && cn.contains( activeTags, tag.s ),
        selected : selectedTag == tag.s
      } );

    });

    view.render( data );

  };

  init();

};

function setOnReady( cb ) {

  onReady = cb;

}


require( '../lib/controllerLoader' )( function( register ) {

  wLib.forEachAnchor( '.cbpgtg', { register: register }, widget );

} );