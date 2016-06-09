"use strict";

const app = require( 'test-app' )( {
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

app.get( '/getMe', mw.getMe );
app.get( '/updateUser', mw.updateProfile );
app.get( '/requestChangeEmail', [ mw.requestChangeEmail, sendEmail ] );
app.get( '/changePassword', mw.changePassword );
app.post( '/deleteAccount', mw.csrfProtection, mw.deleteAccount );
app.post( '/uploadProfileImage', mw.uploadProfileImage );
app.post( '/removeProfileImage', mw.removeProfileImage );

fixtures.init( config );

fixtures( [ {
  table: 'user',
  src: path.resolve( __dirname, '../fixtures/user.data.sql' )
}, {
  table: 'apiKeySet',
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