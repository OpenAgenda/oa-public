"use strict";

const async = require( 'async' ),

app = require( 'test-app' )( {
  frontWrapper: __dirname + '/front.js',
  excludeDefaultStyles: true,
  styles: [
    __dirname + '/../../node_modules/bs-templates/compiled/main.css'
  ],
  decorateCanvas: false
} ),

config = require( '../../testconfig.js' ),

service = require( '../../service' ),

agendaService = require( 'agendas/service/test' ),

mw = service.mw,

utils = require( 'utils' );

async.waterfall( [

  wcb => {

    // agenda search uses agenda service to populate the search index

    agendaService.init( config );

    agendaService.test.fixtures( wcb );

  },
  wcb => {

    // routes agenda search hits on. These are given in on the front
    // side at the react components initialization
    

    app.get( '/', ( req, res, next ) => {

      if ( !req.xhr ) return next();

      // fake internet lag
      setTimeout( next, 1500 );

    } );
    
    app.get( '/', mw.list );

    app.get( '/', ( req, res, next ) => {

      if ( req.xhr ) return next();

      req.content = [ 
        '<div>',
          '<input type="text" class="js_agenda_search"/>', 
        '</div>',
        '<div class="js_search_canvas">',
          req.content,
        '</div>'
      ].join( '' );

      next();

    } );

    wcb();

  }
], err => {

  if ( err ) throw err;

  service.init( utils.extend( {
    services: {
      agendas: agendaService
    }
  }, config ) );

  service.rebuild( () => app.getAndListen() );

} );

