"use strict";

const _ = require( 'lodash' );
const React = require( 'react' );
const ReactDOM = require( 'react-dom/server' );
const sessions = require( '@openagenda/sessions' );
const homeMw = require( '@openagenda/home/dist/middleware' );
const { createMemoryHistory } = require( 'history' );
const createHomeApp = require( '@openagenda/home/dist/client/app' );
const createUserSettingsApp = require( '@openagenda/user-apps/dist/app' );
const createActivitiesApp = require( '@openagenda/activity-apps/dist/client/apps/user' );
const activitiesMw = require( '@openagenda/activity-apps/dist/middleware' );
const config = require( '../config' );
const cmn = require( '../lib/commons-app' );

const phpPrefix = __DEVELOPMENT__ ? '/frontend_dev.php' : '';

const preMw = [
  cmn.loadLogger( 'home' ),
  sessions.middleware.ifUnlogged( ( req, res ) => res.redirect( 302, '/' ) )
];

module.exports = app => {

  app.get(
    '/home',
    preMw,
    cmn.loadBaseData( 'oasfmain.css' ),
    matchApp
  );

  app.get(
    '/home/events',
    preMw,
    cmn.loadBaseData( 'oasfmain.css' ),
    matchApp
  );

  app.get(
    '/home/activities',
    preMw,
    cmn.loadBaseData( 'oasfmain.css' ),
    matchUserActivitiesApp
  );

  app.get(
    '/home/agendas',
    preMw,
    homeMw.agendas.list
  );

  app.get(
    '/home/events.json',
    preMw,
    homeMw.events.list
  );

  app.get(
    '/home/activities/list',
    preMw,
    ( req, res ) => activitiesMw.list( { entityType: 'user', entityUid: req.user.uid } )( req, res )
  );

}

const isNotFound = apps => Object.values( apps )
  .filter( app => app.history )
  .map( app => ({
    state: (app.history.location.state || {}),
    notFoundKey: app.notFoundKey
  }) )
  .every( ( { state, notFoundKey } ) => (state.notFound && state.notFound[ notFoundKey ]) );

async function matchApp( req, res, next ) {
  try {
    const lang = req.lang || 'fr';

    const history = createMemoryHistory( { initialEntries: [ req.originalUrl ] } );
    const apps = {
      home: createHomeApp( {
        req,
        history,
        initialState: {
          settings: {
            prefix: '/home',
            lang,
            apiRoot: '',
            perPageLimit: homeMw.getConfig().mw.limit,
            isNew: req.user.isNew,
            displayLegacyMessageTab: false,
            userId: req.user.id,
            userUid: req.user.uid
          },
          res: {
            agendas: {
              contribute: '/:slug/contribute',
              create: '/new',
              list: '/home/agendas',
              show: '/:slug',
              showPrivate: '/:slug.prv',
              addEvent: `${phpPrefix}/:slug/addevent`,
              moderate: `${phpPrefix}/:slug/admin`,
              contact: '/:slug/contact'
            },
            events: {
              list: '/home/events.json',
              show: '/:slug/events/:eventSlug',
              showPrivate: '/:slug.prv/events/:eventSlug',
              showWithoutAgenda: '/events/:eventSlug',
              edit: '/:slug/event/:eventSlug/edit'
            },
            messages: '/home/messages',
            notifs: '/home/notifications',
            search: '/agendas'
          }
        }
      } ),
      userSettings: createUserSettingsApp( {
        req,
        history,
        initialState: {
          settings: {
            prefix: '/settings',
            lang,
            apiRoot: `http://localhost:${config.port}`
          },
          res: {
            getMe: '/users/me',
            updateProfile: '/users/me',
            deleteAccount: '/users/me',
            changeEmail: '/users/me/requestChangeEmail',
            changePassword: '/users/me/changePassword',
            generateApiKey: '/users/me/generateApiKey',
            uploadProfileImage: '/users/me/setImageProfile',
            removeProfileImage: '/users/me/clearImageProfile'
          }
        }
      } )
    };

    // Triggers all hooks
    await Promise.all(
      Object.values( apps )
        .filter( v => v.triggerHooks )
        .map( v => v.triggerHooks().catch( () => null ) )
    );

    // Render all apps
    const content = ReactDOM.renderToString(
      Object.entries( apps ).map( ( [ key, { element } ] ) =>
        React.cloneElement( element, { key, ...element.props } ) )
    );

    // Avoid all settings.apiRoot
    const initialState = _.mapValues( apps, app => {
      const state = app.store.getState();

      if ( _.get( state, 'settings.apiRoot' ) ) {
        _.set( state, 'settings.apiRoot', '' );
      }

      return state;
    } );

    // Check if it's not found
    if ( isNotFound( apps ) ) {
      return next();
    }

    const { pathname, search } = history.location;

    // Check if <Redirect /> is used
    // for ( const appName in apps ) {
    //   const app = apps[ appName ];
    //
    //   if (
    //     app.staticContext
    //     && app.staticContext.url
    //     && !_.get( app, `history.location.state.${app.notFoundKey}` )
    //   ) {
    //     return res.redirect( app.staticContext.status || 302, app.staticContext.url );
    //   }
    // }

    // Check if location change anywhere else
    if ( decodeURIComponent( req.originalUrl ) !== decodeURIComponent( pathname + search ) ) {
      return res.redirect( 302, pathname + search );
    }

    cmn.render( req, res, 'home/index', {
      scriptParams: {
        initialState
      },
      lang,
      content,
      preloaded: true
    } );
  } catch ( e ) {
    next( e );
  }
}


async function matchUserActivitiesApp( req, res, next ) {
  const prefix = '/home/activities';
  const lang = req.lang || 'fr';

  const { element, triggerHooks, store, staticContext } = createActivitiesApp( {
    req,
    initialState: {
      settings: {
        prefix,
        lang,
        apiRoot: `http://localhost:${config.port}`,
        perPageLimit: homeMw.getConfig().mw.limit
      },
      res: {
        list: '/home/activities/list'
      }
    }
  } );

  try {
    await triggerHooks();

    const content = ReactDOM.renderToString( element );

    const state = store.getState();

    // Remove apiRoot used only on server side
    state.settings.apiRoot = '';

    if ( staticContext.status === 404 ) {
      return next();
    }

    if ( staticContext.url ) {
      return res.redirect( 302, staticContext.url );
    }

    const { pathname, search } = state.router.location;
    if ( decodeURIComponent( req.originalUrl ) !== decodeURIComponent( pathname + search ) ) {
      return res.redirect( 302, pathname );
    }

    cmn.render(
      req,
      res,
      'activities/user',
      { scriptParams: { initialState: state }, lang, content, preloaded: true }
    );
  } catch ( e ) {
    next( e );
  }
}
