"use strict";

const _ = require( 'lodash' );
const bodyParser = require( 'body-parser' );
const cookieParser = require( 'cookie-parser' );
const csurf = require( 'csurf' );
const path = require( 'path' );
const async = require( 'async' );
const fixtures = require( 'fixtures' );
const unsubscribedSvc = require( 'unsubscribed/test/service' );
const service = require( '../service/index' );
const mw = require( '../../middleware' );
const config = require( '../../testconfig.js' );

const app = require( 'test-app' )( {
  frontWrapper: __dirname + '/front.js',
  excludeDefaultStyles: true,
  styles: [
    __dirname + '/../../node_modules/bs-templates/compiled/main.css'
  ],
  decorateCanvas: false,
  webpack: true,
  babelServer: true
} );

app.use( ( req, res, next ) => {
  req.user = { id: 1, uid: 75052324 };
  next();
} );

app.use( bodyParser.urlencoded( { extended: true } ) );
app.use( cookieParser() );

app.get( '/getMe', mw.getMe );
app.get( '/updateUser', mw.updateProfile, ( req, res ) => res.json( req.result ) );
app.get( '/requestChangeEmail', [ mw.requestChangeEmail, sendEmail ] );
app.get( '/changePassword', mw.changePassword );
app.get( '/generateApiKey', mw.generateApiKey );
app.post( '/deleteAccount', [
  mw.deleteAccount,
  ( req, res ) => {
    res.json( { redirectTo: '/logout' } );
  } ] );
app.post( '/uploadProfileImage', mw.uploadProfileImage );
app.post( '/removeProfileImage', mw.removeProfileImage );

unsubscribedSvc.app.useBy( app );

app.get( unsubscribedSvc.app.routes.remove, ( req, res ) => {

  if ( req.result ) return res.json( req.result );

  res.status( 400 ).json( null );

} );

app.get( unsubscribedSvc.app.routes.remove.replace( '.:identifier', '' ), ( req, res ) => {

  if ( req.result ) return res.json( req.result );

  res.status( 400 ).json( null );

} );

app.get( unsubscribedSvc.app.routes.list, ( req, res, next ) => {

  if ( req.result ) {

    if ( req.result.unsubscriptions ) {

      return async.eachOfSeries( req.result.unsubscriptions, ( item, key, cb ) => {

        if ( item.subject !== 'agenda' ) return cb();

        _getAgenda( item.identifier, ( err, agenda ) => {

          if ( err ) return cb( err );

          req.result.unsubscriptions[ key ].agenda = agenda;

          cb();

        } );

      }, err => {

        if ( err ) return next( err );

        return res.json( req.result );

      } );

    }

  }

  next();

} );

async.waterfall( [
  wcb => service.initAndLoad( config ).catch( wcb ).then( () => wcb() ),
  wcb => unsubscribedSvc.initAndLoad( config, { reset: false }, wcb )
], err => {

  if ( err ) return console.error( err );

  app.getAndListen( '*', 3000, [ mw.csrfProtection ] );

} );


function sendEmail( req, res ) {

  const result = Object.assign( {}, req.result );

  delete result.token;

  res.json( result );

}

function _getAgenda( agendaUid, cb ) {

  return cb( null, agendaUid === 85870128 ? {
    slug: 'journees-arts-culture-sup-2017',
    title: '2017 : Journées des Arts et de la Culture dans l\'Enseignement Supérieur'
  } : {
    slug: 'semaineindustrie2017',
    title: 'Semaine de l\'Industrie 2017'
  } );

}