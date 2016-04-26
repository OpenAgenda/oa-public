"use strict";

var supervisor = require( './lib/supervisor' );

module.exports = function( enabledTypes, cb ) {

  if ( !cb && ( typeof enabledTypes == 'function' ) ) {

    cb = enabledTypes;

    enabledTypes = [ 'web' ];

  }

  supervisor( function( loadTasks ) {

    var logger = require( 'logger' ),

    config = require( './config' );

    logger.init( {
      debug: {
        prefix: 'oa:',
        enable: config.logNameSpaces
      },
      token: config.logEntriesToken
    } );

    var mailer = require( 'mailer' ),

    log = logger( 'app' ),

    init = require( './lib/init' ),

    tfy = require( './lib/taskify' );

    log( 'info', 'running server' );


    // load libraries

    var emailStrategie = require( 'emailStrategie' ),

    cmn = require( './lib/commons-app' ),

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

    require( 'agenda-tags' ).init( {
      store: config.db,
      legacy: config.db,
      logger: logger,
      interfaces: require( './services/agenda' ).tags
    } );

    require( 'agenda-categories' ).init( {
      store: config.db,
      legacy: config.db,
      logger: logger
    } );

    require( 'agenda-stakeholders' ).init( {
      schemas : config.schemas,
      mysql: config.db,
      logger: logger
    }, () => {} );

    init.agendaLocations( {
      logger: logger
    }, () => {

      if ( enabledTypes.indexOf( 'task' ) !== -1 ) {

        //require( 'agenda-locations/tasks/associateFreeLocations' )();

        require( 'agenda-locations' ).tasks.setLocationTimezones( err => { } );

      }

    } );

    require( 'images' ).init( {
      tmpPath: config.tmpFolderPath,
      logger: logger
    } );

    require( 'files' ).init( {
      bucket: config.aws.bucket,
      accessKeyId: config.aws.accessKeyId, // required
      secretAccessKey: config.aws.secretAccessKey, // required too
      logger: logger
    } );

    mailer.init( {
      queueName: 'newmailer',
      host: config.redis.host,
      port: config.redis.port,
      log: logger( 'newmailer' )
    } );

    emailStrategie.init( {
      database: config.emailStrategieDb,
      redis: config.redis,
      logger: logger
    } );

    require( 'newsletter' ).init( {
      sendinblue: {
        apiKey: config.sendinblue.apiKey,
        newsletterList: config.sendinblue.newsletterList
      },
      logger: logger
    } );

    require( 'admin-agendas' ).init( {
      mysql: config.db,
      schemas : config.schemas,
      logger: logger
    } );

    webModules = {
      admin: [ // for admins only
        require( './admin/back' )( '/admin' ),
        require( './admin/agendas.back' )( '/admin/agendas' )
      ],
      web: [ // open to the public
        require( './newsletter/back' )( '/:slug/admin/newsletters' ),
        require( './newsletter/front' )( '/:slug/newsletters' ),
        require( './general/front' )( '' ),
        require( './general/back' )( '' ),
        require( './search/front' )( '' ),
        require( './event/form.back' )( '' ),
        require( './event/front' )( '' ),
        require( './event/actions.front' )( '' ),
        require( './event/back' )( '' ),
        require( './auth/comexposium.front' )( '' ),
        require( './auth/facebook.front' )( '' ),
        require( './auth/twitter.front' )( '' ),
        require( './auth/google.front' )( '' ),
        require( './auth/local.front' )( '' ),
        require( './auth/reset.front' )( '/password' ),
        require( './agenda/stakeholders.back' )( '/:slug/admin' ),
        require( './agenda/emailstrategie.back' )( '/:slug/admin/emailstrategie' ),
        require( './agenda/embeds.back' )( '/:slug/admin/embeds' ),
        require( './location/front' )( '/locations' ),
        require( './location/back' )( '' ),
        require( './agenda/shares.front' )( '' ),
        require( './agenda/front' )( '' ),
        require( './agenda/facebook.back' )( '' ),
        require( './agenda/tagcat.back' )( '' ),
        require( './agenda/actions.front' )( '/:slug/actions' ),
        require( './agenda_bridges/back' )( '/:slug/admin/services' ),
        require( './agenda/exports.front' )( '/agendas/:uid' ),
        require( './agenda/exports.back' )( '/agendas/:uid/admin' ),
        require( './agenda/groupActions.back' )( '/agendas/:uid/admin' ),
        require( './legacy/back' )( '/legacy' )
      ]
    };

    app.set( 'trust proxy', 'loopback' );

    app.use( require( 'cookie-parser' )() );

    app.use( require( 'body-parser' ).urlencoded( {
      extended: true,
      limit: 500000
    } ) );

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

      //require( './newsletter/task' ).load( { period: 60000, bootOffset: 15000 } );

      tfy( require( './mailer/task' ), { bootOffset: 14909 } );

      tfy( require( './search/task' ), { bootOffset: 1000 } );

      tfy( require( './general/nominatim.task' ), { bootOffset: 10000, period: 60000*5 } );

      tfy( require( './agenda_bridges/task' ), { bootOffset: 3000 } );

      tfy( require( './general/jobs.task' ), { bootOffset: 1000 } );

      tfy( require( './general/resetApiCounters.task' ), { period: 'daily', time: '00:00' } );

      tfy( require( './services/elasticsearch' ).refresh, { period: 'daily', time: '00:00' } );

      require( './general/mainLogger.task' )();

      require( './event/oembed.task' )();

      require( './services/agenda/task' )();

      require( './services/aggregator' ).task();

      emailStrategie.task();

      mailer.task.setService( config.mailer.service, {
        source: config.mailer.source,
        replyTo: config.mailer.replyTo,
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
        region: config.aws.region
      }, ( err ) => {

        if ( err ) {

          return log( 'error', 'could not set mailer service: %s', err );

        }

        log( 'info', 'launching mailer service' );

        mailer.task();

      });

      require( './services/agenda/controlData' ).task();

      require( './services/lib/instanceQueue/task' )();

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