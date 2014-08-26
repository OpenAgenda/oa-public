var debug = require( 'debug'),

log = debug( 'general' ),

express = require( 'express' ),

mwLib = require( '../middleware' ),

async = require( 'async' ),

w = require( 'when' ),

wn = require( 'when/node' ),

lib = require( '../lib.js' ), 

cibulModel = require( 'cibulModel/lib/cibulModel' ),

router = require( '../router.js' );

module.exports = function( base, config ) {

  var app = express(),

  model = cibulModel( config.db, config.redis ),

  mw = mwLib( model, config );

  app.set( 'base', base );

  app.set( 'name', 'search' );

  app.set( 'perPage', 20 );

  app.all( base + '*', router.loadUrlGen( app ), mw.loadSession );

  router.loadRoutes( app, controllers( app, model, mw ) );

  return app;

};

var controllers = function( app, model, mw ) {

  var map = function() {

    return {
      searchEvent: [ 'get', searchEvents, '/events/search' ],
      searchAgenda: [ 'get', searchAgendas, '/agendas/search' ]
    };

  },

  searchEvents = function( req, res ) {

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

      mw.render( req, res, 'search/events', lib.extend( { events: events }, _layoutData() ));

    })

    .catch( _error( req, res) );

  },

  searchAgendas = function( req, res ) {

    wn.call( model.agendas().list )

    .then( function( agendas ) {

      agendas.forEach( function( agenda ) {

        lib.extend( agenda, {
          categories: [],
          locationInfo: ''
        });

      });

      mw.render( req, res, 'search/agendas', lib.extend( { agendas: agendas }, _layoutData() ));

    })

    .catch( _error( req, res ) );

  },

  _error = function( req, res ) {

    return function( err ) {

      if ( typeof err === 'string' ) err = { message: err };

      mw.errorResponse( req, res, err );

    };

  };

  return map();

},

_layoutData = function( ) {

  return {
    head: {
      css: {
        main: '//d.cibul.net/css/compiled.css'
      }
    }
  };

};