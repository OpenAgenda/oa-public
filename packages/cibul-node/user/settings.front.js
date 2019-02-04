"use strict";

const React = require( 'react' );
const ReactDOM = require( 'react-dom/server' );
const sessions = require( '@openagenda/sessions' );
const createApp = require( '@openagenda/user-apps/dist/app' );
const homeMw = require( '@openagenda/home/dist/middleware' );
const cmn = require( '../lib/commons-app' );
const config = require( '../config' );

const phpPrefix = __DEVELOPMENT__ ? '/frontend_dev.php' : '';

const logged = sessions.middleware.ifUnlogged( ( req, res ) => res.redirect( 302, '/' ) );


module.exports = app => {

  app.get(
    [ '/settings', '/settings/*' ],
    cmn.loadLogger( 'userSettings' ),
    cmn.loadBaseData( 'oasfmain.css' ),
    logged,
    matchApp
  );

};

async function matchApp( req, res, next ) {
  try {
    const lang = req.lang || 'fr';
    const { element, triggerHooks, store, staticContext } = createApp( {
      req,
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
    } );

    await triggerHooks();

    const content = ReactDOM.renderToString( element );

    const state = store.getState();

    // Remove apiRoot used only on server side
    state.settings.apiRoot = '';

    if ( staticContext.status === 404 ) {
      return next();
    }

    if ( staticContext.url ) {
      return res.redirect( 301, staticContext.url );
    }

    const { pathname, search } = state.router.location;
    if ( decodeURIComponent( req.originalUrl ) !== decodeURIComponent( pathname + search ) ) {
      return res.redirect( 301, pathname );
    }

    cmn.render( req, res, 'home/index', {
      scriptParams: {
        initialState: {
          userSettings: state,
          home: {
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
        }
      },
      lang,
      content,
      preloaded: true
    } );
  } catch ( e ) {
    next( e );
  }
}
