var UID = 0, SUBSET = 1,

cn = require( '../../js/lib/common/common.mod.js' ),

wLib = require( '../../lib/widgetLib' ),

debug = require( 'debug' ),

dom = require( './dom.js' );

require( '../lib/controllerLoader' )( function( register ) {

  wLib.forEachAnchor( '.cbpgtg', { register: register }, widget );

} );

var widget = function( elem, options ) {

  var log,

  view = dom( elem ),

  controller,

  enabled = false,

  selectedTag = false,

  tags, tagSlugs,

  requestTags = [], // tags which are in current request state

  activeTags = [],  // tags which are within current event selection

  init = function() {

    var uid = options.anchorConfig[ UID ];

    log = debug( 'tag widget ' + uid );

    controller = options.register( wLib.interface( 'tags', uid, {
      enable : enable,
      disable : disable,
      clear : clear,
      include : include
    } ) );

    view.setOnTagSelect( _onTagSelect );

    view.setOnTagUnselect( _onTagUnselect );

    _setTags( controller, options.anchorConfig );

  },

  enable = function( reqParams ) {

    enabled = true;

    log( 'enabling tag widget' );

    if ( typeof reqParams == 'undefined' ) reqParams = {};

    selectedTag = false;
    requestTags = [];

    // there is no active filter by tag
    if ( !reqParams.tags ) {

      return;

    }

    requestTags = ( typeof reqParams.tags == 'string' ) ? reqParams.tags.split(',') : reqParams.tags;

    // find which tag has been picked
    cn.forEach( requestTags, function( requestTag ) {

      if ( !selectedTag && cn.contains( tagSlugs, requestTag ) ) {

        selectedTag = requestTag;

      }

    });

    _render();

  },

  clear = function() {
    
    log( 'clearing' );

    activeTags = [];
    selectedTag = false;
    requestTags = false;

    _render();

  },


  /**
   * include event tags in active tag set
   */
  
  include = function( eventItem ) {

    if ( eventItem.t && eventItem.t.length ) {

      cn.forEach( eventItem.t, function( eventTag ) {

        if ( contains( tagSlugs, eventTag ) && !contains( activeTags, eventTag ) ) {

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

    if ( !cn.contains( activeTags, tag.slug ) ) return;

    requestTags.push( tag.slug );

    _update();

  },

  _onTagUnselect = function( tag ) {

    requestTags.splice( requestTags.indexOf( tag.slug ), 1 );

    _update();

  },

  _update = function() {

    controller.update( { tags : requestTags.length ? requestTags : null } );

  },


  /**
   * define widget tags set
   */

  _setTags = function( controller, config ) {

    var subset, tagSlugs = [];

    controller.getControlData( function( ctl ) {

      if ( typeof config[ SUBSET ] !== 'undefined' ) {

        subset = config[ SUBSET ].split( ',' );

        cn.forEach( ctl.t, function( tag ) {

          if ( cn.contains( subset, tag.s ) ) {

            tags.push( tag );

            tagSlugs.push( tag.s );

          } 

        });

      } else {

        cn.forEach( ctl.t, function( tag ) {
          
          tags.push( tag );          

          tagSlugs.push( tag.s );

        } );

      }

      log( 'widget initialized with %d tags' );

    });

  },

  _render = function() {

    var data = {
      enabled : enabled,
      tags : []
    };

    cn.forEach( tags, function( tag ) {

     data.tags.push( {
       label : tag.t,
       slug : tag.s,
       active : enabled && ( lib.contains( activeTags, tag.s ) ),
       selected : selectedTag == tag.s
     } )

    });

    view.render( data );

  };

  init();

};