"use strict";

if ( !require( 'piping' )( { hook: true } ) ) return;

const bodyParser = require( 'body-parser' );
const cookieParser = require( 'cookie-parser' );
const async = require( 'async' );
const unsubscribedSvc = require( '@openagenda/unsubscribed/test/service' );
const keysSvc = require( '@openagenda/keys' );
const usersSvc = require( '@openagenda/users/test/service' );
const mw = require( '@openagenda/users/middleware' );
const config = require( '../../testconfig.js' );

const app = require( '@openagenda/test-app' )( {
  frontWrapper: __dirname + '/../../.tmp/testapp-client.js',
  excludeDefaultStyles: true,
  styles: [
    require.resolve( '@openagenda/bs-templates/compiled/main.css' ),
    // __dirname + '/../../node_modules/@openagenda/bs-templates/compiled/main.css'
  ],
  decorateCanvas: false
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

run().catch( console.error );

async function run() {

  await usersSvc.init( config );

  unsubscribedSvc.init( config );

  await keysSvc.init( config );

  app.getAndListen( '*', 3000, [ mw.csrfProtection ] );

}


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