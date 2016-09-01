"use strict";

var controllers = require( '../../widgets/controller/main' ),

qs = require( 'qs' ),

debug = require( 'debug' ),

cn = require( '../../js/lib/common/common.mod' ),

list = require( './list' ),

timeliner = require( './timeliner' ),

adminControls = require( '../../user/js/adminControls' ),

documentLocation = require( 'dom-utils/documentLocation' ),

config = require( './config' ),

favorites = require( './favorites' ),

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
    titleSection: '.js_agenda_title',
    searchLinks: '.js_use_search' // add search params to links with this class
  },
  classes: {
    displayNone: 'display-none'
  }
},

totalLib = require( './total' ), total,

uid;

if ( cn.contains( [ 'tpl', 'dev' ], window.env ) ) {

  debug.enable( '*' );

}

window.hook( function( options ) {

  adminControls.init();

} );

window.asap( function( options ) {

  log = debug( 'agendaPage' );

  log( 'initing' );

  var controller = window.cibul.getController( options.uid ),

  loader,

  uid = options.uid,

  timeline = timeliner( options.lang ),

  total = totalLib( '.js_total', options.lang );

  favorites.init( {
    agendaUid: options.uid,
    res: options.res
  } );

  window.getSession( function( session ) {

    controller.getControlData( function( ctl ) {

      _handleAddButton( session, ctl );

      adminControls( session, {
        testFunc: _isAdmin( ctl )
      } );

    } );

  } );


  if ( !options.empty ) {

    favorites.sweep();

    list.init( {
      total: options.total,
      perPage: options.perPage,
      onLoad: function( err, data ) {

        timeline.dom();

        favorites.sweep();

        total( data.total );

      }
    } );

    _onWidgetLoaded( function() {
    
      log( 'widgets are loaded and initialized' );

    } );

    _onControllerChange( controller, function( newSearchValues ) {

      log( 'query values changed to %s', JSON.stringify( newSearchValues ) );

      let newQuery = {
        oaq: newSearchValues
      }

      if ( documentLocation.getQueryPart( 'lang' ) ) {

        newQuery.lang = documentLocation.getQueryPart( 'lang' );

      }

      documentLocation.setQueryPart( newQuery );

      list.reset( window.location.href );

      _copyToSearch( newSearchValues );

    } );

    _showOptionalWidgets( controller );

  }

} );


function _isAdmin( ctl ) {

  return function( session ) {

    if ( !session.logged ) {

      return false;

    }

    if ( !cn.contains( ctl.adm, parseInt( session.uid, 10 ) )

    && !cn.contains( typeof ctl.mod !== 'undefined' ? ctl.mod : [], parseInt( session.uid, 10 ) ) ) {

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


function _showOptionalWidgets( controller ) {

  controller.getControlData( function( data ) {

    cn.forEach( [ {
      sel: '.js_category_widget',
      key: 'ct'
    }, {
      sel: '.js_tags_widget',
      key: 't'
    }, {
      sel: '.js_org_widget',
      key: 'org'
    } ], function( cfg ) {

      if ( ( typeof data[ cfg.key ] !== 'undefined' ) && data[ cfg.key ].length && cn.el( cfg.sel ) ) {

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


function _copyToSearch( values ) {

  cn.forEach( cn.els( params.selectors.searchLinks ) || [], function( el ) {

    var href = el.getAttribute( 'href' ).split( '?' )[ 0 ] 

             + '?' + qs.stringify( { oaq: values } );

    el.setAttribute( 'href', href );

  });

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