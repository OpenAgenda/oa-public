"use strict";

var supervisor = require( './lib/supervisor' ),

cmn = require( './lib/commons-app' ),

lib = require( './lib/lib' );



module.exports = function( enabledTypes, cb ) {

  if ( !cb && ( typeof enabledTypes == 'function' ) ) {

    cb = enabledTypes;

    enabledTypes = [ 'web' ];

  }

  supervisor( function( loadTasks ) {

    var log = require( './lib/logger' )( 'app' );

    log( 'info', 'running server' );

    // load libraries

    var router = require( './lib/router' )(),

    coms = require( './lib/coms' ),

    express = require( 'express' ),

    cookieSession = require( 'cookie-session' ),

    config = require( './config' ),

    genUrl = require( './lib/genUrl' )( {
      domain: config.domain
    }),

    webModules = {
      admin: [ // for admins only
        require( './admin/back' )( '/admin' )
      ],
      web: [ // open to the public
        require( './newsletter/back' )( '/:slug/admin/newsletters' ),
        require( './newsletter/front' )( '/:slug/newsletters' ),
        [ require( './general/front' )( '' ) ],
        [ require( './search/new' )( '' ) ],
        require( './event/front' )( '' ),
        require( './auth/local.front' )( '' ),
        require( './auth/facebook.front' )( '/facebook' ),
        require( './auth/twitter.front' )( '/twitter' ),
        require( './auth/google.front' )( '/google' ),
        require( './auth/reset.front' )( '/password' ),
        require( './agenda/contributors.back' )( '/:slug/admin/contributors' ),
        require( './agenda/front' )( '' ),
        require( './agenda/actions.front' )( '/:slug/actions' ),
        require( './agenda_bridges/back' )( '/:slug/admin/services' )
      ],
      newWeb: [
        require( './general/front' )( '' ),
        require( './search/new' )( '' )
      ]
    },


    app = express(),

    server;

    app.set( 'trust proxy', 'loopback' );

    app.use( require( 'cookie-parser' )() );

    app.use( cookieSession( config.session ) );


    //===========================================
    /** url generator **/

    // load gen url everywhere
    app.use( function( req, res, next ) {

      req.genUrl = genUrl;

      next();

    });

    cmn.loadLegacyRoutes( genUrl );

    cmn.loadDeprecatedRoutes( genUrl );

    //============================================


    // run 'admin' type modules
    
    if ( enabledTypes.indexOf( 'admin' ) !== -1 ) {

      webModules.admin.forEach( function( m ) {

        m.load( app );

      });

    }

    // run 'web' type modules
    if ( enabledTypes.indexOf( 'web' ) !== -1 ) {

      // deprecate these types...
      webModules.web.forEach( function( m ) {

        if ( lib.isArray( m ) ) {

          // tis a new type module
          
          // load paths in genUrl
          genUrl.load( m[ 0 ].paths );

          // load paths in deprecated router
          cmn.loadInDeprecatedRouter( m[ 0 ].paths );

          m[ 0 ].load( app );

        } else {

          m.load( app );
          
        }


      });

    }


    app.use(function( req, res, next ){

      cmn.catchError( req, res )( { code: 404 } );

    });

    app.use( function( err, req, res, next ) {

      cmn.catchError( req, res )( err );

    });
   

    server = app.listen( config.port );


    // only one process runs background tasks. supervisor handles that.
    // only 'task' types run tasks

    if ( loadTasks && ( enabledTypes.indexOf( 'task' ) !== -1 ) ) {

      require( './newsletter/task' ).load( { period: 60000, bootOffset: 15000 } );
      
      require( './mailer/task' ).load( { bootOffset: 14909 } );
      
      require( './search/task' ).load( { bootOffset: 12483 } );

      require( './general/nominatim.task' ).load( { bootOffset: 10000, period: 60000*5 } );

      require( './agenda_bridges/task' ).load( { bootOffset: 3000 } );

      require( './general/jobs.task' ).load( { bootOffset: 5000 } );

      require( './general/resetApiCounters.task' ).load( { period: 'daily', time: '00:00' } );

      require( './general/mainLogger.task').load();

      require( './event/oembed.task').load();

    }

    if ( cb ) cb( null, server );

    process.on( 'uncaughtException', function (err) {

      log( 'error', 'uncaughtException: %s', err.message );

      console.error( (new Date).toUTCString(), 'uncaught: %s', err.message );

      console.error( err.stack );

      process.exit( 1 )

    } );

  } );

}