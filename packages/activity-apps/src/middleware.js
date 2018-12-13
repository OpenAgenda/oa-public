"use strict";

const _ = require( 'lodash' );
const async = require( 'async' );
const ReactDOMServer = require( 'react-dom/server' );

const matchAppMw = require( '@openagenda/react-utils/dist/matchAppMw' );
const createStore = require( '@openagenda/react-utils/dist/createStore' );
const ApiClient = require( '@openagenda/react-utils/dist/ApiClient' );
const logs = require( '@openagenda/logs' );

const getAdminRoutes = require( './react/apps/admin/routes' );
const getAgendaRoutes = require( './react/apps/agenda/routes' );
const getUserRoutes = require( './react/apps/user/routes' );
const reducer = require( './react/redux/reducer' );
const notificationsApp = require( './react/apps/notifications' );
const log = logs( 'activity-apps/middleware' );;

let activitiesSvc;
let config;

module.exports = {
  matchAdminApp: matchAppMw( createStore( reducer ), getAdminRoutes, ApiClient ),
  matchAgendaApp: matchAppMw( createStore( reducer ), getAgendaRoutes, ApiClient ),
  matchUserApp: matchAppMw( createStore( reducer ), getUserRoutes, ApiClient ),
  init,
  list,
  notifications: {
    count: notificationsCount,
    list: notificationsList,
    markRead: notificationsMarkRead,
    markAllRead: notificationsMarkAllRead,
    remove: notificationsRemove
  }
};

function init( c ) {

  config = c;

  activitiesSvc = c.services.activities;

  if ( c.logger ) {

    logs.setModuleConfig( c.logger );

  }

}

function list( options ) {

  return ( req, res ) => {

    const query = _.pick( req.query, [ 'actor', 'verb', 'object', 'target' ] );
    const limit = config.limit;

    const { datetimeRange, fromId } = req.query;

    if ( datetimeRange ) {
      const [ afterAt, beforeAt ] = datetimeRange.split( '|' );
      query.createdAt = {
        $lte: new Date( beforeAt ),
        $gte: new Date( afterAt )
      };
    }

    const svc = options ? activitiesSvc.feed( options ) : activitiesSvc;

    svc.activities.list( query, fromId || 0, limit )
      .then( activities => {
        res.send( { activities } );
      } )
      .catch( err => {
        res.status( 400 ).send( err );
      } );

  };

}

function notificationsCount( req, res ) {

  activitiesSvc.feed( {
    entityType: 'user',
    entityUid: req.user.uid
  } ).notifications.count( { state: 0 } )
    .then( counter => {

      res.json( { counter } );

    } )
    .catch( err => {

      res.status( 400 ).json( { error: err } );

    } );

}

function notificationsList( req, res ) {

  const limit = req.query.justOne ? 1 : 5;

  activitiesSvc.feed( {
    entityType: 'user',
    entityUid: req.user.uid
  } ).notifications.list( req.query.fromId, limit )
    .then( async notifications => {

      const app = notificationsApp( { notifications, lang: req.lang || 'fr', userUid: req.user.uid } );

      await activitiesSvc.feed( {
        entityType: 'user',
        entityUid: req.user.uid
      } ).notifications.markAs( {}, 1, { allowRegress: false, listArgs: [ 0, 10000 ] } );

      // return activitiesSvc.feed( {
      //   entityType: 'user',
      //   entityUid: req.user.uid
      // } ).notifications.markAs( { ids: notifications.map( v => v.id ) }, 1, { allowRegress: false } )
      //   .then( notifications => {

      return activitiesSvc.feed( {
        entityType: 'user',
        entityUid: req.user.uid
      } ).notifications.count( { state: 0 } )
        .then( counter => {

          res.json( {
            counter,
            notifications,
            html: ReactDOMServer.renderToStaticMarkup( app ),
            lastPage: notifications.length < limit
          } );

        } );

      // } );

    } )
    .catch( err => {

      log( 'error', err );

      res.status( 400 ).json( { error: err } );

    } );

}

function notificationsMarkRead( req, res ) {

  activitiesSvc.feed( {
    entityType: 'user',
    entityUid: req.user.uid
  } ).notifications.markAs( { ids: [ req.params.notifId ] }, 2 )
    .then( notifications => {

      res.json( { notification: notifications.length ? notifications[ 0 ] : null } );

    } )
    .catch( err => {

      res.status( 400 ).json( { error: err } );

    } );

}

function notificationsMarkAllRead( req, res ) {

  let rowsCount = 0;
  let rowsAffected = 0;
  let fromId;

  async.doWhilst(
    dcb => {

      activitiesSvc.feed( {
        entityType: 'user',
        entityUid: req.user.uid
      } ).notifications.list( { stateNot: 2 }, fromId, 100 )
        .then( notifs => {

          rowsCount = notifs.length;
          rowsAffected += notifs.length;

          if ( !notifs.length ) return dcb();

          fromId = _.last( notifs ).id;

          activitiesSvc.feed( {
            entityType: 'user',
            entityUid: req.user.uid
          } ).notifications.markAs( { ids: notifs.map( v => v.id ) }, 2 )
            .then( () => dcb(), dcb );

        } );

    },
    () => rowsCount > 0,
    err => {

      if ( err ) return res.status( 400 ).json( { error: err } );

      res.json( { rowsAffected } );

    }
  );

}

function notificationsRemove( req, res ) {

  activitiesSvc.feed( {
    entityType: 'user',
    entityUid: req.user.uid
  } ).notifications.remove( { ids: [ req.params.notifId ] } )
    .then( notifications => {

      res.json( { notification: notifications.length ? notifications[ 0 ] : null } );

    } )
    .catch( err => {

      res.status( 400 ).json( { error: err } );

    } );

}
