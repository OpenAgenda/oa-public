"use strict";

var supervisor = require( './lib/supervisor' ),

enabledTypes = ( process.argv ? process.argv : [] ).filter( function( argItem ) {

  return [ 'web', 'admin', 'task' ].indexOf( argItem ) !== -1;

});

supervisor( function( loadTasks ) {

  var log = require( './lib/logger' )( 'server' );

  log( 'info', 'running server' );

  // load libraries

  var router = require( './lib/router' ),

  coms = require( './lib/coms' ),

  express = require( 'express' ),

  cookieParser = require( 'cookie-parser' ),

  config = require( './config' ),

  webModules = {
    admin: [ // for admins only
      require( './admin/back' )( '/admin' )
    ],
    web: [ // open to the public
      require( './newsletter/back' )( '/:slug/admin/newsletters' ),
      require( './newsletter/front' )( '/:slug/newsletters' ),
      require( './general/front' )( '' ),
      require( './search/front' )( '' ),
      require( './agenda/front' )( '/:slug' ),
      require( './event/front' )( '' ),
      require( './agenda_bridges/back' )( '/:slug/admin/services' )
    ]
  },

  app = express();

  app.set( 'trust proxy', 'loopback' );

  app.use( require( 'cookie-parser' )() );

  // run 'admin' type modules
  
  if ( enabledTypes.indexOf( 'admin' ) !== -1 ) {

    webModules.admin.forEach( function( m ) {

      m.load( app );

    });

  }

  // run 'web' type modules
  if ( enabledTypes.indexOf( 'web' ) !== -1 ) {

    webModules.web.forEach( function( m ) {

      m.load( app );

    });

  }

  app.listen( config.port );


  // only one process runs background tasks. supervisor handles that.
  // only 'task' types run tasks

  if ( !loadTasks || ( enabledTypes.indexOf( 'task' ) == -1 ) ) return;


  require( './newsletter/task' ).load( { period: 60000, bootOffset: 15000 } );
  
  require( './mailer/task' ).load( { bootOffset: 14909 } );
  
  require( './search/task' ).load( { bootOffset: 12483 } );

  require( './general/nominatim.task' ).load( { bootOffset: 10000, period: 60000*5 } );

  require( './agenda_bridges/task' ).load( { bootOffset: 3000 } );

  require( './general/jobs.task' ).load( { bootOffset: 5000 } );

});