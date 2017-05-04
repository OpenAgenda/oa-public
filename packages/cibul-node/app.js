"use strict";

const supervisor = require( './lib/supervisor' );

module.exports = ( enabledTypes, cb ) => {

  if ( !cb && ( typeof enabledTypes == 'function' ) ) {

    cb = enabledTypes;

    enabledTypes = [ 'web' ];

  }

  supervisor( loadTasks => {

    let logger = require( 'logger' ),

      config = require( './config' );

    require( './services/init' )( err => {

      const log = logger( 'app' );

      if ( err ) return log( 'error', 'could not load app: %s', err );

      const tfy = require( './lib/taskify' ),

        cmn = require( './lib/commons-app' ),

        express = require( 'express' ),

        bodyParser = require( 'body-parser' ),

        sessions = require( 'sessions' ),

        _ = require( 'lodash' );

      log( 'info', 'running server' );

      let app = express(),

        server,

        genUrl = require( './services/genUrl' ).getSingleton(),

        webModules = {
          admin: [ // for admins only
            require( './admin/back' )( '/admin' ),
            require( './admin/agendas.back' )( '/admin/agendas' ),
            require( './admin/activities.back' )( '/admin/activities' )
          ],
          web: [ // open to the public
            require( './home/back' )( '/home' ),
            require( './user/settings.back' )( '/settings' ),
            require( './newsletter/back' )( '/:slug/admin/newsletters' ),
            require( './newsletter/front' )( '/:slug/newsletters' ),
            require( './general/front' )( '' ),
            require( './general/session.back' )( '/session' ),
            require( './general/back' )( '' ),
            require( './search/front' )( '' ),
            require( './event/form.back' )( '' ),
            require( './event/tagsForm.back' )( '/:slug/events/:eventSlug/tagcat' ),
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
            require( './location/suggestions.front' )( '/:slug/locations/:locationUid/suggest' ),
            require( './location/back' )( '' ),
            require( './agenda/settings.back' )( '' ),
            require( './agenda/sources.back' )( '/:slug/admin' ),
            require( './agenda/members.back' )( '/:slug/admin/members' ),
            require( './agenda/activities.back' )( '/:slug/admin/activities' ),
            require( './agenda/shares.front' )( '' ),
            require( './agenda/front' )( '' ),
            require( './agenda/back' )( '' ),
            require( './agenda/facebook.back' )( '' ),
            require( './agenda/tagcat.back' )( '' ),
            require( './agenda/actions.front' )( '/:slug/actions' ),
            require( './agenda/exports.front' )( '/agendas/:uid' ),
            require( './agenda/exports.back' )( '/agendas/:uid/admin' ),
            require( './agenda/groupActions.back' )( '/agendas/:uid/admin' )
          ],
          webAndTask: [
            require( './legacy/back' )( '/legacy' )
          ]
        };


      app.set( 'trust proxy', 'loopback' );

      app.use( sessions.middleware );

      app.use( bodyParser.urlencoded( {
        extended: true,
        limit: 500000
      } ) );

      app.use( ( req, res, next ) => {

        res.setHeader( 'X-Powered-By', 'OpenAgenda' );

        next();

      } );


      // load gen url everywhere
      app.use( ( req, res, next ) => {

        req.genUrl = genUrl.copy(); // need genUrl only for request lifecycle

        next();

      } );

      app.use( ( req, res, next ) => {

        req.log = logger( 'req' );

        req.log.load( { url: req.originalUrl } );

        next();

      } );

      app.use( cmn.lang );

      cmn.loadLegacyRoutes( genUrl );

      webModules.web.concat( webModules.admin ).concat( webModules.webAndTask ).forEach( m => {

        genUrl.load( m.paths );

      } );

      // run 'admin' type modules
      if ( enabledTypes.indexOf( 'admin' ) !== -1 ) {

        webModules.admin.forEach( m => m.load( app ) );

      }

      // run 'web' type modules
      if ( enabledTypes.indexOf( 'web' ) !== -1 ) {

        webModules.web.forEach( m => m.load( app ) );

      }

      if ( enabledTypes.includes( 'task' ) || enabledTypes.includes( 'web' ) ) {

        webModules.webAndTask.forEach( m => m.load( app ) );

        // delegate more to repo-ed services
        require( './general/unsubscribed.front' )( app, '/unsubscribe' );

      }

      app.use( ( req, res, next ) => {

        cmn.catchError( req, res )( { code: 404 } );

      } );

      app.use( ( err, req, res, next ) => {

        cmn.catchError( req, res )( err );

      } );


      // only one process runs background tasks. supervisor handles that.
      // only 'task' types run tasks

      if ( loadTasks && ( enabledTypes.indexOf( 'task' ) !== -1 ) ) {

        //require( './newsletter/task' ).load( { period: 60000, bootOffset: 15000 } );

        tfy( require( './mailer/task' ), { bootOffset: 14909 } );

        tfy( require( './search/task' ), { bootOffset: 1000 } );

        tfy( require( './general/nominatim.task' ), { bootOffset: 10000, period: 60000 * 5 } );

        //tfy( require( './agenda_bridges/task' ), { bootOffset: 3000 } );

        tfy( require( './general/jobs.task' ), { bootOffset: 1000 } );

        tfy( require( './general/resetApiCounters.task' ), { period: 'daily', time: '00:00' } );

        tfy( require( './services/elasticsearch' ).refresh, { period: 'daily', time: '00:00' } );

        tfy( require( './services/notification/remove.task' ), { period: 'daily', time: '03:00' } );

        tfy( require( 'agenda-search' ).rebuild, { period: 'daily', time: '01:00' } );

        require( './general/mainLogger.task' )();

        require( './event/oembed.task' )();

        require( './services/agenda/task' )();

        require( './services/aggregator' ).task();

        require( 'emailStrategie' ).task();

        require( 'mailer' ).task();

        require( './services/agenda/controlData' ).task();

        require( './services/lib/instanceQueue/task' )();

        require( 'agenda-stakeholders' ).tasks.bulk();

        require( 'agenda-stakeholders' ).tasks.message();

        require( './activities/task' )();

      }

      server = app.listen( config.port );

      if ( cb ) cb( null, server );

      process.on( 'uncaughtException', err => {

        log( 'error', 'uncaughtException: %s', err.message );

        console.error( ( new Date ).toUTCString(), 'uncaught: %s', err.message );

        console.error( err.stack );

        process.exit( 1 );

      } );

    } );

  } );

}