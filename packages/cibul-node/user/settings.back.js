"use strict";

const sessions = require( '@openagenda/sessions' ),

  cmn = require( '../lib/commons-app' ),

  logged = sessions.middleware.ifUnlogged( cmn.redirectTo() ),

  loadSession = sessions.middleware.load( { detailed: true } ),

  log = require( '@openagenda/logger' )( 'user/settings.back' ),

  modLib = require( '../lib/moduleLib.js' ),

  _ = require( 'lodash' ),

  mailer = require( '@openagenda/mailer' ),

  users = require( '@openagenda/users' ),

  usersMw = require( '@openagenda/users/middleware' ),

  matchApp = require( '@openagenda/user-apps/dist/matchAppMw' ),

  labels = require( '../../labels/users/settings' ),

  getLabels = require( '../../labels/makeLabelGetter' )( labels );


module.exports = path => {

  const routes = {
    userSettingsApp: [ 'get', '*', [ logged, loadSession, matchApp( {
      state: {
        app: {
          appSettings: {
            prefix: path
          }
        }
      }
    }, path, index ) ] ]
  };
  const router = modLib.Router( routes );

  router.pre( [
    cmn.loadLogger( 'userSettings' ),
    cmn.loadBaseData( 'oasfmain.css' )
  ] );

  return {
    load: router.load( path ),
    paths: modLib.getPaths( path, routes )
  }

  function index( req, res ) {

    const lang = req.lang || 'fr';

    const scriptParams = {
      prefix: path,
      lang,
      urls: {
        getMe: '/users/me',
        updateProfile: '/users/me',
        deleteAccount: '/users/me',
        changeEmail: '/users/me/requestChangeEmail',
        changePassword: '/users/me/changePassword',
        generateApiKey: '/users/me/generateApiKey',
        uploadProfileImageRes: '/users/me/setImageProfile',
        removeProfileImageRes: '/users/me/clearImageProfile',
        listUnsubscriptions: '/unsubscribe/u/:userUid/list',
        removeUnsubscription: '/unsubscribe/u/:userUid/s/:subject.:identifier/t/:type/remove'
      }
    };

    cmn.render( req, res, 'user/settings', { scriptParams, lang } );

  }

};
