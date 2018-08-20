"use strict";

const supervisor = require( './lib/supervisor' );

module.exports = function ( enabledTypes, options, cb ) {

  if ( arguments.length === 1 && typeof arguments[ 0 ] === 'function' ) {

    cb = enabledTypes;

    enabledTypes = [ 'web' ]

  } else if ( arguments.length === 2 ) {

    cb = options;

    options = {};

  }

  supervisor( loadTasks => {

    require( './services/init' )( options, err => {

      const _ = require( 'lodash' );
      const http = require( 'http' );
      const express = require( 'express' );

      const sessions = require( '@openagenda/sessions' );
      const logger = require( '@openagenda/logger' );
      const tfy = require( './lib/taskify' );
      const cmn = require( './lib/commons-app' );
      const config = require( './config' );
      const errorLogger = require( './services/00_errors' );

      const log = logger( 'app' );

      if ( err ) {

        console.log( err );

        return log( 'error', 'could not load app: %s', err );

      }

      if ( __DEVELOPMENT__ ) {
        require( 'source-map-support' ).install( { hookRequire: true } );
      }

      log( 'info', 'running server' );

      const app = express();
      const server = http.createServer( app );

      const genUrl = require( './services/genUrl' ).getSingleton();

      const webModules = {
        admin: [ // for admins only
          require( './admin/back' )( '/admin' ),
          require( './admin/agendas.back' )( '/admin/agendas' ),
          require( './admin/activities.back' )( '/admin/activities' )
        ],
        web: [ // open to the public
          require( './home/back' )( '/home' ),
          require( './user/settings.front' )( '/settings' ),
          require( './general/front' )( '' ),
          require( './general/session.back' )( '/session' ),
          require( './general/back' )( '' ),
          require( './search/front' )( '' ),
          require( './event/form.back' )( '' ),
          require( './event/tagsForm.back' )( '/:slug/events/:eventSlug/tagcat' ),
          require( './event/back' )( '' ),
          require( './event/front' )( '' ),
          require( './event/actions.front' )( '' ),
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
          require( './agenda/settings.back' )( '' ),
          require( './agenda/sources.back' )( '/:slug/admin' ),
          require( './agenda/members.back' )( '/:slug/admin/members' ),
          require( './agenda/activities.back' )( '/:slug/admin/activities' ),
          require( './agenda/shares.front' )( '' ),
          require( './agenda/front' )( '' ),
          require( './agenda/exports.back' )( '/agendas/:uid/admin' ),
          require( './agenda/groupActions.back' )( '/agendas/:uid/admin' ),
          require( './agenda/facebook.back' )( '' ),
          require( './agenda/customized.back' )( '' ),
          require( './agenda/actions.front' )( '/:slug/actions' ),
          require( './agenda/exports.front' )( '/agendas/:uid' ),
          require( './activities/notifications.back' )( '/notifications' )
        ],
        webAndTask: [
          require( './legacy/back' )( '/legacy' )
        ]
      };

      app.set( 'trust proxy', 'loopback' );

      app.use( sessions.middleware );

      app.use( ( req, res, next ) => {

        res.setHeader( 'X-Powered-By', 'OpenAgenda' );

        next();

      } );

      app.use( require( './services/logRequests' ).middleware );


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
      if ( enabledTypes.includes( 'admin' ) ) {

        webModules.admin.forEach( m => m.load( app ) );

      }

      // run 'web' type modules
      if ( enabledTypes.includes( 'web' ) ) {

        require( './event/search.front' )( app, '/events/search' );
        require( './agenda/back' )( app );
        require( './inboxes/back' )( app );
        require( './inboxes/front' )( app );
        require( './services/surveys' )( app, '' );
        //require( './services/agendaContribute' )( app, '' );
        require( './services/users' )( app, '/users' );

        require( './event/files' )( app, '/' );

        require( './services/agendaDocx' )( app, '/docx' );

        require( './api' );

        // /:agendaSlug/calendar
        require( './services/agendaCalendar' )( app, '' );

        webModules.web.forEach( m => m.load( app ) );

      }

      if ( enabledTypes.includes( 'task' ) || enabledTypes.includes( 'web' ) ) {

        webModules.webAndTask.forEach( m => m.load( app ) );

        // delegate more to repo-ed services
        require( './general/unsubscribed.front' )( app, '/unsubscribe' );
        require( './agenda/json.export' )( app, '/' );
        require( './agenda/exports' )( app, '/' );

      }

      app.use( ( req, res, next ) => {

        next( { code: 404 } );

      } );

      app.use( ( err, req, res, next ) => {

        cmn.catchError( req, res )( err );

        // 404s and co are not to be logged by error handler
        if ( ![ 401, 403, 404, 413 ].includes( _.get( err, 'code', null ) ) ) {

          errorLogger( 'middleware', err );

        }

      } );


      // only one process runs background tasks. supervisor handles that.
      // only 'task' types run tasks

      if ( loadTasks && enabledTypes.includes( 'task' ) ) {

        tfy( require( './search/task' ), { bootOffset: 1000 } );

        tfy( require( './general/jobs.task' ), { bootOffset: 1000 } );

        tfy( require( './general/resetApiCounters.task' ), { period: 'daily', time: '00:00' } );

        tfy( require( './services/elasticsearch' ).refresh, { period: 'daily', time: '00:00' } );

        tfy( require( './services/notification/remove.task' ), { period: 'daily', time: '03:00' } );

        tfy( require( '@openagenda/agenda-search' ).rebuild, { period: 'daily', time: '01:00' } );

        tfy( require( '@openagenda/agenda-monitor' ).tasks.evaluate, { period: 'daily', time: '19:00' } );

        tfy( require( '@openagenda/activities' ).tasks.notifications.prepareSummary, {
          period: 'daily',
          time: '05:00'
        } );

        tfy( require( '@openagenda/activities' ).tasks.notifications.sendSummary, {
          period: 'daily',
          time: '08:00'
        } );

        tfy( require( '@openagenda/inboxes' ).tasks.sync, {
          period: 'weekly',
          day: 'sunday',
          time: '11:00'
        } );

        tfy( require( './services/activities/tasks/rebuild' ), {
          period: 'weekly',
          day: 'monday',
          time: '03:00'
        } );

        require( 'agenda-docx' ).task();

        require( './general/mainLogger.task' )();

        require( './services/agenda/task' )();

        require( './services/aggregator' ).task();

        require( '@openagenda/email-strategie' ).task();

        require( './services/agenda/controlData' ).task();

        require( '@openagenda/agenda-stakeholders' ).tasks.bulk();

        require( '@openagenda/agenda-stakeholders' ).tasks.message();

        require( './services/event/oembed' ).task();

        require( './services/agendaStatistics' ).task();

        require( '@openagenda/custom' ).task();

        require( '@openagenda/activities' ).tasks.notifications.addActivity();

        require( '@openagenda/mails' ).task();

        /*require( './services/elasticsearch' ).resync( { reset: false }, ( err, res ) => {
          console.log( 'FINI', err, res );
        } );*/

        //require( './services/agendaStatistics' ).task.resyncLegacySearch();

        // require( '@openagenda/inboxes' ).tasks.sync();

        //require( '@openagenda/events' ).tasks.slowTransfer( { force: true, interval: 500 } );

        /*require( 'agenda-events').tasks.transferUserUids().then( report => {

          console.log( 'done!' );
          console.log( report );

        } ); */

        /*require( 'async' ).eachSeries( [ 55750, 3204291, 9761904, 9788289,13315500,15029117,15518291,16482835,17540015,19378824,25565771,27373160,29187378,30013147,33431413,35706423,36293687,36938083,40682349,43429663,43734901,44641740,45654961,47747797,47753493,48223923,49523420,49759107,51842062,60511877,60839018,61198287,61769221,62067159,64727419,65197251,66376417,67699870,69863067,70615195,70873206,71616772,72056182,75356940,76268329,78197229,79414561,79642759,79956696,79989652,80522802,81532949,81850636,83103616,83945917,84529570,84691336,86489159,87180696,89095402,89742210,90716457,94265385,95507509,97878981,98082620 ], ( uid, ecb ) => {

          require( './services/events' ).legacy.onUpdate( { uid }, ecb );

        }, err => {

          console.log( err );

        } );*/


        // plug legacy plateform lifecycle event to agenda event service
        require( './services/agendaEvents/legacy' ).task();

        // handle interfaces for grouped operations ( a remove of a 100 refs queues 100 onRemoves executions )
        require( '@openagenda/agenda-events' ).tasks.interfaces( { interval: 10 } );

        //require( '@openagenda/agenda-events' ).tasks.transferLegacyData( { interval: 500 } );

        require( './services/eventSearch' ).task();

      }

      server.listen( config.port, () => {

        log( 'info', '-- Server listening on port %s --', config.port );

      } );

      if ( cb ) cb( null, server );

    } );

  } );

}
