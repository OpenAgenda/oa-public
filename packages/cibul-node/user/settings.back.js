"use strict";

const sessions = require( '@openagenda/sessions' ),

  cmn = require( '../lib/commons-app' ),

  logged = sessions.middleware.ifUnlogged( cmn.redirectTo() ),

  loadSession = sessions.middleware.load( { detailed: true } ),

  config = require( '../config' ),

  log = require( '@openagenda/logger' )( 'user/settings.back' ),

  modLib = require( '../lib/moduleLib.js' ),

  _ = require( 'lodash' ),

  moment = require( 'moment' ),

  async = require( 'async' ),

  mailer = require( '@openagenda/mailer' ),

  users = require( '@openagenda/users' ),

  usersMw = require( '@openagenda/users/middleware' ),

  matchApp = require( '@openagenda/users/middleware/matchApp' ),

  labels = require( '@openagenda/labels/users/settings' ),

  getLabels = require( '@openagenda/labels' )( labels );


module.exports = path => {

  const routes = {
      userSettingsGetMe: [ 'get', '/getMe', [ logged, loadSession, usersMw.getMe ] ],
      userSettingsUpdateProfile: [ 'get', '/updateProfile', [
        loadSession, // obliged to load detailed session as users.get does not take uid as alternative identifier
        logged,
        usersMw.updateProfile,
        ( req, res, next ) => {

          if ( req.result.success ) {
            return _.flow(
              sessions.middleware.open( 'user', 'sessionResult' ),
              req.result.success ? sessions.middleware.sync( 'syncResult' ) : ( req, res, next ) => next(),
            )( req, req, next );
          }

          next();

        },
        ( req, res ) => res.json( req.result )
      ] ],
      userSettingsChangeEmail: [ 'get', '/changeEmail', [
        logged,
        loadSession,
        usersMw.requestChangeEmail,
        sendEmail
      ] ],
      userSettingsChangeEmailConfirmation: [ 'get', '/changeEmail/confirm', [
        logged,
        loadSession,
        usersMw.confirmChangeEmail.bind( null, { /**defaultOptions**/ } ),
        changeEmailConfirm
      ] ],
      userSettingsChangePassword: [ 'get', '/changePassword', [ logged, loadSession, usersMw.changePassword ] ],
      userSettingsGenerateApiKey: [ 'get', '/generateApiKey', [ logged, loadSession, usersMw.generateApiKey ] ],
      userSettingsDeleteAccount: [ 'post', '/deleteAccount', [
        logged,
        loadSession,
        usersMw.deleteAccount,
        ( req, res ) => {

          sessions.setFlash( req, res, getLabels( 'accountRemoved', req.lang ) );

          res.json( { redirectTo: req.genUrl( 'signout' ) } );

        } ] ],
      userSettingsUploadProfileImage: [ 'post', '/uploadProfileImage', [ logged, loadSession, usersMw.uploadProfileImage ] ],
      userSettingsRemoveProfileImage: [ 'post', '/removeProfileImage', [ logged, loadSession, usersMw.removeProfileImage ] ],

      userSettingsApp: [ 'get', '*', [ logged, loadSession, matchApp( {
        state: {
          app: {
            appSettings: {
              prefix: path
            }
          }
        }
      }, path, index ) ] ]
    },

    router = modLib.Router( routes );

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

    usersMw.csrf( req, res, () => {

      const scriptParams = {
        prefix: path,
        lang,
        urls: {
          getMe: '/getMe',
          updateProfile: '/updateProfile',
          changeEmail: '/changeEmail',
          changePassword: '/changePassword',
          generateApiKey: '/generateApiKey',
          deleteAccount: '/deleteAccount',
          uploadProfileImageRes: '/uploadProfileImage',
          removeProfileImageRes: '/removeProfileImage',
          listUnsubscriptions: '/unsubscribe/u/:userUid/list',
          removeUnsubscription: '/unsubscribe/u/:userUid/s/:subject.:identifier/t/:type/remove'
        },
        csrfToken: req.csrfToken()
      };

      cmn.render( req, res, 'user/settings', { scriptParams, lang } );
    } );

  }

};


function changeEmailConfirm( req, res, next ) {

  sessions.setFlash( req, res, getLabels( req.result.success ? 'changeEmailSuccess' : 'changeEmailFail', req.lang ) );

  res.redirect( req.genUrl( 'homeShow' ) );

}


function sendEmail( req, res, next ) {

  const result = Object.assign( {}, req.result || null );

  if ( result.token && req.query.email ) {
    users.get( req.user, ( err, user ) => {

      const lang = req.lang || 'fr';
      const link = req.genUrl( 'userSettingsChangeEmailConfirmation', {
        token: result.token,
        uid: user.uid
      }, { protocol: 'https://' } );

      mailer( {
        recipient: req.query.email,
        subject: getLabels( 'validationEmailSubject', lang ),
        data: {
          logo: 'https://openagenda.com/images/openagenda.png',
          title: {
            text: getLabels( 'validationEmailSubject', lang ),
            link
          },
          action: {
            label: getLabels( 'validationEmailAction', lang ),
            link
          },
          description: getLabels( 'validationEmailContent', lang ),
        }
      } );

      delete result.token;
      res.json( result );

    } );
  }

}
