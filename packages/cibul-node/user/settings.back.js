"use strict";

const sessions = require( 'sessions' ),

  cmn = require( '../lib/commons-app' ),

  logged = sessions.middleware.ifUnlogged( cmn.redirectTo() ),

  loadSession = sessions.middleware.load( { detailed: true } ),

  config = require( '../config' ),

  log = require( 'logger' )( 'user/settings.back' ),

  modLib = require( "../lib/moduleLib.js" ),

  moment = require( 'moment' ),

  async = require( 'async' ),

  mailer = require( 'mailer' ),

  templater = require( 'cibulTemplates' ),

  users = require( 'users' ),

  mw = users.mw,

  matchApp = require( 'users/middleware/matchApp' ),

  labels = require( 'labels/users/settings' ),

  getLabels = require( 'labels' )( labels );


module.exports = path => {

  const routes = {
      userSettingsGetMe: [ 'get', '/getMe', [ logged, loadSession, mw.getMe ] ],
      userSettingsUpdateProfile: [ 'get', '/updateProfile', [
        loadSession, // obliged to load detailed session as users.get does not take uid as alternative identifier
        logged,
        mw.updateProfile,
        ( req, res, next ) => {

          if ( req.result.success ) return sessions.middleware.sync( 'syncResult' )( req, res, next );

          next();

        },
        ( req, res ) => res.json( req.result )
      ] ],
      userSettingsChangeEmail: [ 'get', '/changeEmail', [ 
        logged, 
        loadSession, 
        mw.requestChangeEmail, 
        sendEmail 
      ] ],
      userSettingsChangeEmailConfirmation: [ 'get', '/changeEmail/confirm', [
        logged,
        loadSession,
        mw.confirmChangeEmail.bind( null, {/**defaultOptions**/} ),
        changeEmailConfirm
      ] ],
      userSettingsChangePassword: [ 'get', '/changePassword', [ logged, loadSession, mw.changePassword ] ],
      userSettingsGenerateApiKey: [ 'get', '/generateApiKey', [ logged, loadSession, mw.generateApiKey ] ],
      userSettingsDeleteAccount: [ 'post', '/deleteAccount', [
        logged,
        loadSession,
        mw.deleteAccount,
        ( req, res ) => {

          sessions.setFlash( req, res, getLabels( 'accountRemoved', req.lang ) );

          res.json( { redirectTo: req.genUrl( 'signout' ) } );

        } ] ],
      userSettingsUploadProfileImage: [ 'post', '/uploadProfileImage', [ logged, loadSession, mw.uploadProfileImage ] ],
      userSettingsRemoveProfileImage: [ 'post', '/removeProfileImage', [ logged, loadSession, mw.removeProfileImage ] ],

      userSettingsApp: [ 'get', '*', [ logged, loadSession, matchApp( path, index ) ] ]
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

    mw.csrf( req, res, () => {

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
