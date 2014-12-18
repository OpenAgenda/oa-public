"use strict";

var controllers = require( '../../widgets/controller/main' ),

qs = require( 'qs' ),

debug = require( 'debug' ),

cn = require( '../../js/lib/common/common.mod' ),

partialLoader = require( './partialLoader' ),

handleSourceMenu = require( './handleSourceMenu' ),

config = require( './config' ),

pagination = require( './pagination' ),

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

if ( [ 'tpl', 'dev' ].indexOf( window.env ) !== -1 ) {

  debug.enable( '*' );

}

window.hook( function( options ) {

  var currentQueryValues = _getQueryValues( window.location.href ),

  controller = window.cibul.getController( options.uid ),

  loader,

  uid = options.uid;

  log = debug( 'agendaPage' );

  window.getSession( function( session ) {

    controller.getControlData( function( ctl ) {

      _handleAddButton( session, ctl );

      _handleAdminButton( session, ctl );

    } );

    _handleAddToSource( uid, session );

  } );

  if ( !options.empty ) {

    loader = partialLoader( cn.extend( config.partialOptions, {
      canvas: cn.el( params.selectors.list )
    }));

    pagination.init( {
      href: window.location.href,
      total: options.total,
      perPage: options.perPage,
      loader: loader
    } );

    _handleWidgets( controller, currentQueryValues, function( newSearchValues ) {

      log( 'query values changed' );

      var newHref = window.location.href.split( '?' )[0];

      if ( cn.size( newSearchValues ) ) {

        newHref += '?' + qs.stringify( { search: newSearchValues } );

      }

      currentQueryValues.search = newSearchValues;

      loader.replace( newHref, function( err, data ) {

        pagination.reset( newHref, data.total );

      } );

    } );

    _setPassedAgendaFilter( controller, currentQueryValues );

    _showOrganizationWidget( controller );

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



/**
 * load widgets callback when the controller state changes
 */

function _handleWidgets( controller, queryValues, onChange ) {

  var searchValues = ( typeof queryValues.search == 'undefined' ) ? {} : queryValues.search;

  controller.update( searchValues );

  _onWidgetLoaded( function() {

    log( 'widgets are loaded and initialized' );

    controller.sweep();

  });

  _onControllerChange( controller, onChange );

}


/**
 * toggle display of admin button
 */

function _handleAdminButton( session, ctl ) {

  if ( !_isLoggedAdmin( session, ctl ) ) {

    return;

  }

  cn.removeClass( cn.el( params.selectors.admin ), params.classes.displayNone );

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
  
  if ( !_isLoggedAdmin( session, ctl ) ) {

    return;

  }

  _displayAddButton();

}


function _setPassedAgendaFilter( controller, currentQueryValues ) {

  controller.getControlData( function( ctl ) {

    if ( ( ctl.p === true ) && ( !cn.size( currentQueryValues ) ) ) {

      log( 'initing with passed filter' );

      currentQueryValues.passed = '1';

      controller.update( currentQueryValues );

    }

  });

}


function _showOrganizationWidget( controller ) {

  controller.getControlData( function( data ) {

    if ( ( typeof data.org !== 'undefined' ) && data.org.length ) {

      cn.removeClass( cn.el( params.selectors.org ), params.classes.displayNone );

    }

  });

}


function _isLoggedAdmin( session, ctl ) {

  if ( !session.logged ) {

    return false;

  }

  if  ( !cn.contains( ctl.adm, session.uid ) ) {

    return false;

  }

  return true;

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

  controller.register( { 
    name: 'site', 
    change: function( newValues ) {

      controller.requestModal( 'site' );

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