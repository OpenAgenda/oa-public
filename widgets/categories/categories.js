var UID = 0,

cn = require(  '../../js/lib/common/common.mod.js' ),

wLib = require(  '../lib/widgetLib' ),

debug = require( 'debug' ),

dom = require( './dom.js' );

if ( window.env == 'tpl' ) debug.enable( '*' );


var widget = function( elem, options ) {

  var log,

  view = dom( elem ),

  controller,

  enabled = false,

  selectedCategory = false,

  categories = [], categorySlugs = [],

  activeCategories = [],  // categories which are within current event selection
  
  init = function() {

    var uid = options.anchorConfig[ UID ];

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

      if ( !data.ebd || data.ebd.dcss ) view.setDefaultStyle();

      log( 'init complete, enable to render' );

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

    selectedCategory = null;

  },

  include = function( eventItem ) {

    if ( eventItem.c && !cn.contains( activeCategories, eventItem.c ) ) {

      activeCategories.push( eventItem.c );

    }

  },

  disable = function() {

    enabled = false;

    _render();

  },

  _onCategorySelect = function( category ) {

    log( 'selected %s with slug %s', category.label, category.slug );

    if ( !cn.contains( activeCategories, category.slug ) ) {

      log( 'category is not active. ignoring' );

      return;

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

    controller.update( 'categories', { category : selectedCategory } );

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
        selected : selectedCategory == category.s,
        className : undefined
      } );

    });

    view.render( data );

  };

  init();

}

require( '../lib/controllerLoader' )( function( register ) {

  wLib.forEachAnchor( '.cbpgct', { register: register }, widget );

} );