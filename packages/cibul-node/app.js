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

    webModules,

    app = express(),

    server;

    cmn.loadGenUrl( genUrl );

    webModules = {
      admin: [ // for admins only
        require( './admin/back' )( '/admin' )
      ],
      web: [ // open to the public
        require( './newsletter/back' )( '/:slug/admin/newsletters' ),
        require( './newsletter/front' )( '/:slug/newsletters' ),
        require( './general/front' )( '' ),
        require( './search/front' )( '' ),
        require( './event/front' )( '' ),
        require( './event/back' )( '' ),
        require( './auth/local.front' )( '' ),
        require( './auth/facebook.front' )( '/facebook' ),
        require( './auth/twitter.front' )( '/twitter' ),
        require( './auth/google.front' )( '/google' ),
        require( './auth/reset.front' )( '/password' ),
        require( './agenda/contributors.back' )( '/:slug/admin/contributors' ),
        require( './agenda/front' )( '' ),
        require( './agenda/actions.front' )( '/:slug/actions' ),
        require( './agenda_bridges/back' )( '/:slug/admin/services'),
        require( './agenda/exports.front' )( '/agendas/:uid' ),
        require( './agenda/exports.back' )( '/agendas/:uid/admin' ),
      ]
    };

    app.set( 'trust proxy', 'loopback' );

    app.use( require( 'cookie-parser' )() );

    app.use( require( 'body-parser' ).urlencoded( { extended: true } ) );

    app.use( cookieSession( config.session ) );


    // load gen url everywhere
    app.use( function( req, res, next ) {

      req.genUrl = genUrl;

      next();

    });

    app.use( function( req, res, next ) {

      req.log = require( './lib/logger' )( 'req' );

      req.log.load( { url: req.originalUrl } );

      next();

    });

    cmn.loadLegacyRoutes( genUrl );

    

    // run 'admin' type modules
    
    if ( enabledTypes.indexOf( 'admin' ) !== -1 ) {

      webModules.admin.forEach( function( m ) {

        // load paths in genUrl
        genUrl.load( m.paths );

        // load paths in deprecated router
        cmn.loadInDeprecatedRouter( m.paths );

        m.load( app );

      });

    }

    // run 'web' type modules
    if ( enabledTypes.indexOf( 'web' ) !== -1 ) {

      webModules.web.forEach( function( m ) {

        // load paths in genUrl
        genUrl.load( m.paths );

        // load paths in deprecated router
        cmn.loadInDeprecatedRouter( m.paths );

        m.load( app );

      });

      cmn.loadDeprecatedRoutes( genUrl );

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