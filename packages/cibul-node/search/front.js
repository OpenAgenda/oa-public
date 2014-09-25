/**
 * site-wide event and agenda search pages
 */

var appName = 'search/front',

exposed = {
  load: load
},

routes = {
  searchEvents: [ 'get', searchEvents, '/events/search' ],
  searchAgendas: [ 'get', searchAgendas, '/agendas/search' ]
},

log = require( '../lib/logger' )( appName ),

async = require( 'async' ),

w = require( 'when' ),

wn = require( 'when/node' ),

lib = require( '../lib/lib' ),

cmn = require( '../lib/commons-app' ),

app,

path,

model = cmn.getCibulModel();


function init( p ) {

  log( 'initing' );

  path = p;

  cmn.registerRoutes( appName, path, routes);

  return exposed;

}


function load( main ) {

  if ( app ) {

    log( 'this app has already been loaded');

    return;

  }

  log( 'loading' );

  app = cmn.loadApp( main, path, appName );

  app.set( 'perPage', 20 );

  cmn.loadRoutes( app, routes, [
    cmn.urlGenSetter( appName, path ),
    cmn.loadSession
  ] );

  return exposed;

}


/**
 * controllers
 */

function searchEvents( req, res ) {

  wn.call( model.events().list )

  .then( function( events ) {

    events.forEach( function( event ) {

      var inst = model.events().instance( event );

      // each event item is extend with whatever is required by tem¶plate

      lib.extend( event, {
        dateRange: inst.getDateRange( true ),
        title: inst.getTitle(),
        description: inst.getDescription(),
        placeName: event.locations ? event.locations[0].name : false
      });

    });

    cmn.render( req, res, 'search/events', lib.extend( { events: events }, _layoutData(), _pager( req, searchEvents, 20 ) ));

  })

  .catch( _error( req, res) );

}


function searchAgendas( req, res ) {

  wn.call( model.agendas().list )

  .then( function( agendas ) {

    agendas.forEach( function( agenda ) {

      lib.extend( agenda, {
        categories: [],
        locationInfo: ''
      });

    });

    cmn.render( req, res, 'search/agendas', lib.extend( { agendas: agendas }, _layoutData(), _pager( req, searchAgendas, 20 ) ));

  })

  .catch( _error( req, res ) );

}


/**
 * controller helpers
 */

function _error( req, res ) {

  return function( err ) {

    if ( typeof err === 'string' ) err = { message: err };

    cmn.errorResponse( req, res, err );

  };

}



function _layoutData( ) {

  return {
    head: {
      css: {
        main: '//d.cibul.net/css/compiled.css'
      }
    }
  };

}

function _pager( req, routeName, totalItems ) {

  return {
    pager: {
      base: {},
      routeName: routeName,
      current: req.query.page || 1,
      total: totalItems,
      perPage: app.get('perPage')
    }
  };

}


module.exports = init;