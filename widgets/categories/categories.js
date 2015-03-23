"use strict";

exports.setOnReady = setOnReady;

var UID = 0, MODE = 1,

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

  selectedCategory = false,

  categories = [], passedCategorySlugs = [],

  activeCategories = [],  // categories which are within current event selection

  init = function() {

    var uid = options.anchorConfig[ UID ];

    if ( options.anchorConfig[ MODE ] ) {

      view.setMode( options.anchorConfig[ MODE ] )

    }

    log = debug( 'categories widget ' + uid );

    log( 'initing' );

    controller = options.register( wLib.interface( 'categories', uid, {
      enable : enable,
      disable : disable,
      clear : clear,
      include : include
    } ) );

    view.setOnSelect( _onCategorySelect );

    view.setOnUnselect( _onCategoryUnselect );

    controller.getControlData( function( data ) {

      log( 'fetched agenda control data' );

      _setCategories( data );

      if ( data.ebd && data.ebd.dcss ) view.setDefaultStyle();

      log( 'init complete, enable to render' );

      if ( onReady ) onReady();

    });

  },

  enable = function( reqParams ) {

    enabled = true;

    log( 'enabling category widget' );

    if ( typeof reqParams == 'undefined' ) reqParams = {};

    selectedCategory = null;

    if ( reqParams.category ) {

      selectedCategory = reqParams.category;

    }

    _render();

  },

  clear = function() {

    log( 'clearing, awaiting enable or disable to render' );

    activeCategories = [];

    passedCategorySlugs = [];

    selectedCategory = null;

  },

  include = function( eventItem ) {

    if ( !eventItem.c ) return;

    if ( !cn.contains( activeCategories, eventItem.c ) ) {

      activeCategories.push( eventItem.c );

    }

    if ( eventItem.passed ) {

      passedCategorySlugs.push( eventItem.c );

    }

  },

  disable = function() {

    enabled = false;

    _render();

  },

  _onCategorySelect = function( category ) {

    log( 'selected %s with slug %s', category.label, category.slug );

    if ( !cn.contains( activeCategories, category.slug ) ) {

      log( 'category is not active. using anyways' );

    }

    selectedCategory = category.slug;

    _update();

  },

  _onCategoryUnselect = function( category ) {

    log( 'unselect %s with slug %s', category.label, category.slug );

    if ( selectedCategory !== category.slug ) {

      log( 'unselect category "%s" is not as expected "%s"', category.slug, selectedCategory );

      return;

    }

    selectedCategory = null;

    _update();

  },


  _update = function() {

    var updatedRequestParams = { category : selectedCategory };

    if ( cn.contains( passedCategorySlugs, selectedCategory ) ) {

      updatedRequestParams.passed = '1';

    }

    controller.update( 'categories', updatedRequestParams );

  },


  _setCategories = function( data ) {

    log( 'defining widget categories' );

    categories = data.ct;

    log( 'widget initialized with %d categories', categories.length );

  },

  _render = function() {

    log( 'rendering as %s', enabled ? 'enabled' : 'disabled' );

    var data = {
      enabled : enabled,
      categories : []
    };

    cn.forEach( categories, function( category ) {

      data.categories.push( {
        label : category.c,
        slug : category.s,
        active : enabled && cn.contains( activeCategories, category.s ),
        className : category.cl,
        selected : selectedCategory == category.s
      } );

    });

    view.render( data );

  };

  init();

}

function setOnReady( cb ) {

  onReady = cb;

}


require( '../lib/controllerLoader' )( function( register ) {

  wLib.forEachAnchor( '.cbpgct', { register: register }, widget );

} );