"use strict";

const app = require( 'test-app' )( {
    frontWrapper: __dirname + '/front.js',
    excludeDefaultStyles: true,
    styles: [
      __dirname + '/../../node_modules/bs-templates/compiled/main.css'
    ],
    decorateCanvas: false
  } ),

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
app.get( '/updateProfile', mw.updateProfile );
app.get( '/changeEmail', mw.changeEmail );
app.get( '/changePassword', mw.changePassword );

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

  app.getAndListen( '*' );

} );