"use strict";

const async = require( 'async' ),

app = require( '@openagenda/test-app' )( {
  frontWrapper: __dirname + '/front.js',
  excludeDefaultStyles: true,
  styles: [
    __dirname + '@openagenda/bs-templates/compiled/main.css'
  ],
  decorateCanvas: false
} ),

config = require( '../../testconfig.js' ),

service = require( '../../service' ),

agendaService = require( '@openagenda/agendas/service/test' ),

mw = service.mw,

utils = require( '@openagenda/utils' );

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

      req.lang = 'fr';

      if ( !req.xhr ) return next();

      // fake internet lag
      setTimeout( next, 1500 );

    } );
    
    app.get( '/', mw.list );

    app.get( '/:format', mw.list );

    app.get( '/', ( req, res, next ) => {

      req.content = [ 
        '<div>',
          '<form class="js_agenda_search">',
            '<input type="text"/>', 
          '</form>',
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

  service.init( utils.extend( config, {
    services: {
      agendas: agendaService
    }
  } ) );

  service.rebuild( () => app.getAndListen() );

} );

