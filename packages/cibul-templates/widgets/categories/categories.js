"use strict";

exports.setOnReady = setOnReady;

var UID = 0, MODE = 1,

cn = require(  '../../js/lib/common/common.mod.js' ),

wLib = require(  '../lib/widgetLib' ),

debug = require( 'debug' ),

dom = require( './dom.js' ),

onReady;

if ( cn.contains( [ 'tpl', 'development' ], window.env ) ) debug.enable( '*' );


var widget = function( elem, options ) {

  var log,

  view = dom( elem ),

  controller,

  enabled = false,

  selectedCategory = false,

  categories = [], passedCategorySlugs = [],

  activeCategories = {};  // categories which are within current event selection
  

  function init() {

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

      controller.onWidgetReady( 'categories', { uid } );

      if ( onReady ) onReady();

    });

  }


  function enable( reqParams ) {

    enabled = true;

    log( 'enabling category widget' );

    if ( typeof reqParams == 'undefined' ) reqParams = {};

    selectedCategory = null;

    if ( reqParams.category ) {

      selectedCategory = reqParams.category;

    }

    _render();

  }


  function clear() {

    log( 'clearing, awaiting enable or disable to render' );

    activeCategories = {};

    passedCategorySlugs = [];

    selectedCategory = null;

  }


  function include( eventItem ) {

    if ( !eventItem.c ) return;

    if ( typeof activeCategories[ eventItem.c ] == 'undefined' ) {

      activeCategories[ eventItem.c ] = 0;

    }

    activeCategories[ eventItem.c ]++;

    if ( eventItem.passed ) {

      // add eventual eventTag to Slugs
      if ( !cn.contains( passedCategorySlugs, eventItem.c ) ) passedCategorySlugs.push( eventItem.c );

    } else {

      let passedCategoryIndex = passedCategorySlugs.indexOf( eventItem.c );

      if ( passedCategoryIndex !== -1 ) {

        passedCategorySlugs.splice( passedCategoryIndex, 1 );

      }

    }

  }


  function disable() {

    enabled = false;

    _render();

  }


  function _onCategorySelect( category ) {

    log( 'selected %s with slug %s', category.label, category.slug );

    selectedCategory = category.slug;

    _update();

  }


  function _onCategoryUnselect( category ) {

    log( 'unselect %s with slug %s', category.label, category.slug );

    if ( selectedCategory !== category.slug ) {

      log( 'unselect category "%s" is not as expected "%s"', category.slug, selectedCategory );

      return;

    }

    selectedCategory = null;

    _update();

  }


  function _update() {

    var updatedRequestParams = { category : selectedCategory };

    if ( cn.contains( passedCategorySlugs, selectedCategory ) ) {

      updatedRequestParams.passed = '1';

    }

    controller.update( 'categories', updatedRequestParams );

  }


  function _setCategories( data ) {

    log( 'defining widget categories' );

    categories = data.ct;

    log( 'widget initialized with %d categories', categories.length );

  }


  function _render() {

    log( 'rendering as %s', enabled ? 'enabled' : 'disabled' );

    var data = {
      enabled : enabled,
      categories : []
    };

    cn.forEach( categories, function( category ) {

      var count = ( typeof activeCategories[ category.s ] !== 'undefined' ? activeCategories[ category.s ] : 0 );

      var classes = [],

      selected = selectedCategory == category.s,

      active = enabled && count;

      if ( category.cl ) {

        classes.push( category.cl );

      }

      if ( selected ) classes.push( 'selected' );

      if ( active ) {

        classes.push( 'active' );

      } else {

        log( 'category not active' );

      }

      if ( !count ) classes.push( 'no-current-match' );

      data.categories.push( {
        label : category.c,
        slug : category.s,
        classes : ' ' + classes.join( ' ' ),
        selected : selected,
        count : count
      } );

    });

    view.render( data );

  }

  init();

}

function setOnReady( cb ) {

  onReady = cb;

}


require( '../lib/loader' )( {
  selector: '.cbpgct',
  widget: widget,
  backup: {
    selector: '[data-oact]',
    classNames: 'cibulCategories'
  }
} );