"use strict";

var config = require( '../config' ),

  log = require( 'logger' )( 'user/settings.back' ),

  modLib = require( "../lib/moduleLib.js" ),

  cmn = require( '../lib/commons-app' ),

  moment = require( 'moment' ),

  async = require( 'async' ),

  mailer = require( 'mailer' ),

  templater = require( 'cibulTemplates' ),

  users = require( 'users' ),

  mw = users.mw,

  labels = require( 'labels/users/settings' ),

  getLabels = require( 'labels' )( labels );


module.exports = function ( path ) {

  var routes = {
    userSettingsGetMe: [ 'get', '/getMe', [ cmn.requireLogged(), mw.getMe ] ],
    userSettingsUpdateProfile: [ 'get', '/updateProfile', [ cmn.requireLogged(), mw.updateProfile ] ],
    userSettingsChangeEmail: [ 'get', '/changeEmail', [ cmn.requireLogged(), mw.requestChangeEmail, sendEmail ] ],
    userSettingsChangeEmailConfirmation: [ 'get', '/changeEmail/confirm', mw.confirmChangeEmail ],
    userSettingsChangePassword: [ 'get', '/changePassword', [ cmn.requireLogged(), mw.changePassword ] ],
    userSettingsGenerateApiKey: [ 'get', '/generateApiKey', [ cmn.requireLogged(), mw.generateApiKey ] ],
    userSettingsDeleteAccount: [ 'post', '/deleteAccount', [
      cmn.requireLogged(),
      ( req, res, next ) => {
        req.redirectTo = req.genUrl( 'signout' )
        next();
      },
      mw.deleteAccount,
      ( req, res ) => {
        req.setFlash( 'Your account was successfully deleted' );
        res.json( { redirectTo: req.redirectTo } );
      } ] ],
    userSettingsUploadProfileImage: [ 'post', '/uploadProfileImage', [ cmn.requireLogged(), mw.uploadProfileImage ] ],
    userSettingsRemoveProfileImage: [ 'post', '/removeProfileImage', [ cmn.requireLogged(), mw.removeProfileImage ] ],

    userSettingsApp: [ 'get', '*', mw.matchApp( path, index ) ]
  };

  var router = modLib.Router( routes );

  moment.locale( 'fr' );

  router.pre( [
    cmn.loadLogger( 'userSettings' ),
    cmn.flashSetter,
    cmn.loadBaseData( 'oasfmain.css' ),
    cmn.loadSession
  ] );

  return {
    load: router.load( path ),
    paths: modLib.getPaths( path, routes )
  }

  function index( req, res ) {

    mw.csrf( req, res, () => {

      const scriptParams = {
        prefix: path,
        lang: req.lang || 'fr',
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

      cmn.render( req, res, 'user/settings', { scriptParams } );
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