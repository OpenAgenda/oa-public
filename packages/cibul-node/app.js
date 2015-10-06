"use strict";

var supervisor = require( './lib/supervisor' );

module.exports = function( enabledTypes, cb ) {

  if ( !cb && ( typeof enabledTypes == 'function' ) ) {

    cb = enabledTypes;

    enabledTypes = [ 'web' ];

  }

  supervisor( function( loadTasks ) {

    var emailStrategie = require( 'emailStrategie' ),

    logger = require( 'logger' ),

    log = logger( 'app' ),

    config = require( './config' );

    logger.init( {
      debug: {
        prefix: 'oa:',
        enable: config.logNameSpaces
      },
      token: config.logEntriesToken
    } );

    log( 'info', 'running server' );

    // load libraries

    var cmn = require( './lib/commons-app' ),

    express = require( 'express' ),

    cookieSession = require( 'cookie-session' ),

    genUrl = require( './services/genUrl' ).init( {
      domain: config.domain,
    } ),

    webModules,

    app = express(),

    server;

    require( 'facebook' ).init( {
      app: config.auth.facebook,
      routes: {
        tabRedirect: config.root + '/facebook/tab/create/:state'
      },
      db: config.db
    }, function( err ) { if ( err ) log( 'error', err ); } );

    emailStrategie.init( {
      database: config.emailStrategieDb,
      redis: config.redis,
      logger: logger
    } );

    webModules = {
      admin: [ // for admins only
        require( './admin/back' )( '/admin' )
      ],
      web: [ // open to the public
        require( './newsletter/back' )( '/:slug/admin/newsletters' ),
        require( './newsletter/front' )( '/:slug/newsletters' ),
        require( './general/front' )( '' ),
        require( './search/front' )( '' ),
        require( './event/form.back' )( '' ),
        require( './event/front' )( '' ),
        require( './event/actions.front' )( '' ),
        require( './event/back' )( '' ),
        require( './auth/facebook.front' )( '' ),
        require( './auth/twitter.front' )( '' ),
        require( './auth/google.front' )( '' ),
        require( './auth/local.front' )( '' ),
        require( './auth/reset.front' )( '/password' ),
        require( './agenda/stakeholders.back' )( '/:slug/admin' ),
        require( './agenda/emailstrategie.back' )( '/:slug/admin/emailstrategie' ),
        require( './agenda/embeds.back' )( '/:slug/admin/embeds' ),
        require( './location/front' )( '/locations' ),
        require( './agenda/front' )( '' ),
        require( './agenda/facebook.back' )( '' ),
        require( './agenda/actions.front' )( '/:slug/actions' ),
        require( './agenda_bridges/back' )( '/:slug/admin/services'),
        require( './agenda/exports.front' )( '/agendas/:uid' ),
        require( './agenda/exports.back' )( '/agendas/:uid/admin' ),
        require( './agenda/groupActions.back' )( '/agendas/:uid/admin' ),
        require( './legacy/back' )( '/legacy' )
      ]
    };

    app.set( 'trust proxy', 'loopback' );

    app.use( require( 'cookie-parser' )() );

    app.use( require( 'body-parser' ).urlencoded( { extended: true } ) );

    app.use( cookieSession( config.session ) );

    app.use( function ( req, res, next ) {

      res.removeHeader( 'X-Powered-By' );
      
      next();

    } );


    // load gen url everywhere
    app.use( function( req, res, next ) {

      req.genUrl = genUrl.copy(); // need genUrl only for request lifecycle

      next();

    });

    app.use( function( req, res, next ) {

      req.log = logger( 'req' );

      req.log.load( { url: req.originalUrl } );

      next();

    });

    cmn.loadLegacyRoutes( genUrl );

    webModules.web.concat( webModules.admin ).forEach( function( m ) {

      genUrl.load( m.paths );

    } );

    // run 'admin' type modules
    
    if ( enabledTypes.indexOf( 'admin' ) !== -1 ) {

      webModules.admin.forEach( function( m ) {

        m.load( app );

      });

    }

    // load paths in genUrl


    // run 'web' type modules
    if ( enabledTypes.indexOf( 'web' ) !== -1 ) {

      webModules.web.forEach( function( m ) {

        m.load( app );

      });

    }


    app.use(function( req, res, next ){

      cmn.catchError( req, res )( { code: 404 } );

    });

    app.use( function( err, req, res, next ) {

      cmn.catchError( req, res )( err );

    });
   

    if ( enabledTypes.indexOf( 'web' ) !== -1 || enabledTypes.indexOf( 'admin' ) !== -1 ) {

      server = app.listen( config.port );

    }


    // only one process runs background tasks. supervisor handles that.
    // only 'task' types run tasks

    if ( loadTasks && ( enabledTypes.indexOf( 'task' ) !== -1 ) ) {

      require( './newsletter/task' ).load( { period: 60000, bootOffset: 15000 } );
      
      require( './mailer/task' ).load( { bootOffset: 14909 } );
      
      require( './search/task' ).load( { bootOffset: 1000 } );

      require( './general/nominatim.task' ).load( { bootOffset: 10000, period: 60000*5 } );

      require( './agenda_bridges/task' ).load( { bootOffset: 3000 } );

      require( './general/jobs.task' ).load( { bootOffset: 1000 } );

      require( './general/resetApiCounters.task' ).load( { period: 'daily', time: '00:00' } );

      require( './general/mainLogger.task').load();

      require( './event/oembed.task' ).load();

      require( './services/agenda/task' ).load();

      require( './services/aggregator' ).task();

      emailStrategie.task();

      require( './services/agenda/controlData' ).task();

    }

    if ( cb ) cb( null, server );

    process.on( 'uncaughtException', function ( err ) {

      log( 'error', 'uncaughtException: %s', err.message );

      console.error( (new Date).toUTCString(), 'uncaught: %s', err.message );

      console.error( err.stack );

      process.exit( 1 )

    } );

  } );

}