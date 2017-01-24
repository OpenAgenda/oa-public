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
      loadSession,
      logged,
      mw.updateProfile,
      ( req, res, next ) => {

        if ( req.success ) return sessions.middleware.sync();

        next();

      },
      ( req, res ) => res.json( req.result )
    ] ],
    userSettingsChangeEmail: [ 'get', '/changeEmail', [ logged, loadSession, mw.requestChangeEmail, sendEmail ] ],
    userSettingsChangeEmailConfirmation: [ 'get', '/changeEmail/confirm', mw.confirmChangeEmail ],
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
          removeProfileImageRes: '/removeProfileImage'
        },
        csrfToken: req.csrfToken()
      };

      cmn.render( req, res, 'user/settings', { scriptParams, lang } );
    } );

  }

};


function sendEmail( req, res, next ) {

  const result = Object.assign( {}, req.result || null );

  if ( result.token && req.query.email ) {
    users.get( req.user, ( err, user ) => {
      const emailData = {
        recipient: req.query.email,
        link: req.genUrl( 'userSettingsChangeEmailConfirmation', {
          token: result.token,
          uid: user.uid
        }, { protocol: 'https://' } ),
        lang: req.lang || 'fr'
      };

      _sendEmail( emailData, err => {
        if ( err ) next( err );

        delete result.token;
        res.json( result );
      } );
    } );
  }

}

function _sendEmail( { link, recipient, lang }, cb ) {

  const renders = {};
  const emailData = {
    title: {
      text: getLabels( 'validationEmailSubject', lang )
    },
    description: 'Bonjour,\n\nVous avez demandé à changer l\'adresse email liée à votre compte OpenAgenda.' +
    'Cliquez sur ce lien pour confirmer le changement d\'email ' + link + '\n\n' +
    'Si vous n\'êtes pas l\'auteur de la demande de changement d\'adresse email, ne cliquez pas sur le lien, tout simplement.'
  };

  async.each( [ 'html', 'text' ], ( type, ecb ) => {

    templater( 'email/show', Object.assign( { type }, emailData ), ( err, render ) => {

      if ( err ) return ecb( err );

      renders[ type ] = render;

      ecb();

    } );

  }, err => {

    if ( err ) return cb( err );

    mailer( {
      recipient,
      subject: getLabels( 'validationEmailSubject', lang ),
      text: renders.text,
      html: renders.html
    } );

    cb();

  } );

}