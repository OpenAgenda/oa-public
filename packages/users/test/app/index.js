"use strict";

const bodyParser = require( 'body-parser' ),

  cookieParser = require( 'cookie-parser' ),

  app = require( 'test-app' )( {
    frontWrapper: __dirname + '/front.js',
    excludeDefaultStyles: true,
    styles: [
      __dirname + '/../../node_modules/bs-templates/compiled/main.css'
    ],
    decorateCanvas: false,
    webpack: true,
    babelServer: true
  } ),

  csurf = require( 'csurf' ),

  path = require( 'path' ),

  fixtures = require( 'fixtures' ),

  config = require( '../../testconfig.js' ),

  service = require( '../../service' ),

  mw = service.mw;


app.use( ( req, res, next ) => {
  req.user = { id: 119 };
  next();
} );

app.use( bodyParser.urlencoded( { extended: true } ) );
app.use( cookieParser() );

app.get( '/getMe', mw.getMe );
app.get( '/updateUser', mw.updateProfile );
app.get( '/requestChangeEmail', [ mw.requestChangeEmail, sendEmail ] );
app.get( '/changePassword', mw.changePassword );
app.get( '/generateApiKey', mw.generateApiKey );
app.post( '/deleteAccount', [
  ( req, res, next ) => {
    req.redirectTo = '/logout';
    next();
  }, mw.deleteAccount,
  ( req, res ) => {
    res.json( { redirectTo: req.redirectTo } );
    req.setFlash('Your account has been deleted');
  } ] );
app.post( '/uploadProfileImage', mw.uploadProfileImage );
app.post( '/removeProfileImage', mw.removeProfileImage );

fixtures.init( config );

fixtures( [ {
  table: 'user',
  src: path.resolve( __dirname, '../fixtures/user.data.sql' )
}, {
  table: 'api_key_set',
  src: path.resolve( __dirname, '../fixtures/api_key_set.data.sql' )
} ], err => {

  if ( err ) return console.error( err );

  service.init( config );

  app.getAndListen( '*', 3000, [ mw.csrfProtection ] );

} );

function sendEmail( req, res ) {

  const result = Object.assign( {}, req.result );

  delete result.token;

  res.json( result );

}