'use strict';

const _ = require( 'lodash' );
const React = require( 'react' );
const ReactDOM = require( 'react-dom/server' );
const { createMemoryHistory } = require( 'history' );
const asyncMatchRoutes = require( '@openagenda/react-utils/dist/asyncMatchRoutes' );
const homeMw = require( '@openagenda/home/dist/middleware' );
const createHomeApp = require( '@openagenda/home/dist/client/app' );
const createUserSettingsApp = require( '@openagenda/user-apps/dist/app' );
const config = require( '../config' );
const cmn = require( '../lib/commons-app' );

const phpPrefix = __DEVELOPMENT__ ? '/frontend_dev.php' : '';


module.exports = app => {

  app.get(
    [ '/home', '/home/events', '/settings/?*?' ],
    cmn.loadLogger( 'webapp' ),
    cmn.loadBaseData( 'oasfmain.css' ),
    matchApp
  );

};

function redirectIfNeeded( req, res, history ) {
  const { pathname, search } = history.location;

  if ( decodeURIComponent( req.originalUrl ) !== decodeURIComponent( pathname + search ) ) {
    res.redirect( 302, pathname + search );
    return true;
  }
}

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
            isNew: _.get( req, 'user.isNew' ),
            displayLegacyMessageTab: false,
            userId: _.get( req, 'user.id' ),
            userUid: _.get( req, 'user.uid' )
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

    const visibleApps = await Object.entries( apps )
      .reduce( async ( result, [ key, app ] ) => {
        const { components } = await asyncMatchRoutes( app.routes, req.originalUrl );

        if ( !components.some( v => (v && v.isNotFound) ) ) {

          return {
            ...await result,
            [ key ]: app
          }
        }

        return result;
      }, {} );

    // Triggers hooks
    await Promise.all(
      Object.values( visibleApps )
        .filter( v => v.triggerHooks )
        .map( v => v.triggerHooks().catch( () => null ) )
    );

    // Check if redirect in hooks
    if ( redirectIfNeeded( req, res, history ) ) {
      return;
    };

    // Render all visible apps
    const content = ReactDOM.renderToString( Object.values( visibleApps ).map( v => v.element ) );

    // Check if it's not found
    if ( !Object.keys( visibleApps ).length ) {
      return next();
    }

    // Check if <Redirect /> is used
    for ( const appName in visibleApps ) {
      const app = apps[ appName ];

      if (
        app.staticContext
        && app.staticContext.url
        && !_.get( app, `staticContext.location.state.${app.notFoundKey}` )
      ) {
        return res.redirect( app.staticContext.status || 302, app.staticContext.url );
      }
    }

    // Check if location change anywhere else
    if ( redirectIfNeeded( req, res, history ) ) {
      return;
    };

    // Avoid all settings.apiRoot
    const initialState = _.mapValues( apps, app => {
      const state = app.store.getState();

      if ( _.get( state, 'settings.apiRoot' ) ) {
        _.set( state, 'settings.apiRoot', '' );
      }

      return state;
    } );

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
