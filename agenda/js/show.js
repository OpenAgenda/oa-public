"use strict";

var controllers = require( '../../widgets/controller/main' ),

qs = require( 'qs' ),

debug = require( 'debug' ),

cn = require( '../../js/lib/common/common.mod' ),

list = require( './list' ),

timeliner = require( './timeliner' ),

handleSourceMenu = require( './handleSourceMenu' ),

modalPartial = require( '../../bsLayout/js/modalPartial' ),

adminControls = require( '../../user/js/adminControls' ),

config = require( './config' ),

widgets = {
  search: require( '../../widgets/search/search' ),
  tags: require( '../../widgets/tags/tags' ),
  categories: require( '../../widgets/categories/categories' ),
  map: require( '../../widgets/map/map' ),
  calendar: require( '../../widgets/calendar/calendar' ),
  activeFilters: require( '../../widgets/activeFilters/activeFilters' ),
  organizations: require( '../../widgets/organizations/organizations' )
},

log,

params = {
  selectors: {
    list: '.js_list_content',
    add: '.js_add_button',
    admin: '.js_admin_button',
    org: '.js_org_widget',
    titleSection: '.js_agenda_title'
  },
  classes: {
    displayNone: 'display-none'
  }
},

uid;

if ( cn.contains( [ 'tpl', 'dev' ], window.env ) ) {

  debug.enable( '*' );

}

window.hook( function( options ) {

  var controller = window.cibul.getController( options.uid ),

  loader,

  uid = options.uid,

  timeline = timeliner( options.lang );
  
  log = debug( 'agendaPage' );

  adminControls.init();

  _handleImportButton();


  window.getSession( function( session ) {

    controller.getControlData( function( ctl ) {

      _handleAddButton( session, ctl );

      adminControls( session, {
        testFunc: _isAdmin( ctl )
      } );

    } );

    _handleAddToSource( uid, session );


  } );


  if ( !options.empty ) {

    modalPartial.multiple( cn.els( '.js_event_action' ) );

    list.init( {
      total: options.total,
      perPage: options.perPage,
      onLoad: function() {

        modalPartial.multiple( cn.els( '.js_event_action' ) );

        timeline.dom();

      }
    } );

    _onWidgetLoaded( function() {
    
      log( 'widgets are loaded and initialized' );

    });

    _onControllerChange( controller, function( newSearchValues ) {

      log( 'query values changed to %s', JSON.stringify( newSearchValues ) );

      list.reset( _getHref( newSearchValues ) );

    } );

    _showOptionalWidgets( controller );

  }

});



/**
 * toggle display of "add to source" link
 */

function _handleAddToSource( uid, session ) {

  if ( !session.logged ) {

    return;

  }

  if ( typeof session.aggregator == 'undefined' ) {

    return;

  }

  if ( !session.aggregator ) {

    return;

  }

  handleSourceMenu( uid, cn.el( params.selectors.titleSection ), session );

}





function _isAdmin( ctl ) {

  return function( session ) {

    if ( !session.logged ) {

      return false;

    }

    if ( !cn.contains( ctl.adm, parseInt( session.uid, 10 ) )

    && !cn.contains( ctl.mod, parseInt( session.uid, 10 ) ) ) {

      return false;

    }

    return true;

  }

}



/**
 * toggle display of add button
 */

function _handleAddButton( session, ctl ) {

  // if agenda is contributive in any way, add button is shown.

  if ( parseInt( ctl.c, 10 ) !== 0 ) {

    _displayAddButton();

    return;

  }


  // agenda is not contributive from here on. user must be admin
  
  if ( !_isAdmin( ctl )( session ) ) {

    return;

  }

  _displayAddButton();

}


function _handleImportButton() {

  modalPartial( cn.el( '.js_import_action' ) );

}



function _showOptionalWidgets( controller ) {

  controller.getControlData( function( data ) {

    cn.forEach( [ {
      sel: '.js_category_widget', key: 'ct'
    }, {
      sel: '.js_tags_widget', key: 'tg'
    }, {
      sel: '.js_org_widget', key: 'org'
    } ], function( cfg ) {

      if ( ( typeof data[ cfg.key ] !== 'undefined' ) && data[ cfg.key ].length ) {

        cn.removeClass( cn.el( cfg.sel ), params.classes.displayNone );

      }

    } );

  });

}


function _onWidgetLoaded( cb ) {

  log( 'setting widget ready callbacks' );

  var loadCount = 0,

  _onReady = function() {

    loadCount++;

    if ( loadCount == cn.size( widgets ) ) {

      cb();

    }

  };

  for ( var widgetName in widgets ) {

    widgets[ widgetName ].setOnReady( _onReady );

  }

}


function _displayAddButton() {

  cn.removeClass( cn.el( params.selectors.add ), params.classes.displayNone );

}


function _onControllerChange( controller, cb ) {

  var currentSearchValues = controller.getCurrentQuery();

  log( 'registering page list as widget' );

  controller.register( { 
    name: 'site', 
    enable: function( newValues ) {

      if ( !controller.isDifferent( currentSearchValues ) ) {

        return;

      }

      currentSearchValues = cn.extend( {}, newValues );

      cb( newValues );

    }
  });

}


function _getQueryValues( href, key ) {

  var v = href.split( '?' );

  if ( v.length == 1 ) return {};

  v = qs.parse( v[1].split('#').shift() );

  if ( !key ) return v;

  return v[key] ? v[key] : {};

}


function _getHref( values ) {

  var href = window.location.href.split( '?' )[0];

  if ( cn.size( values ) ) {

    href += '?' + qs.stringify( { search: values } );

  }

  return href;

}