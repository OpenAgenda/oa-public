"use strict";

const fixtures = require( '@openagenda/fixtures' );

const config = require( '../../testconfig.js' );
const svc = require( '../../' );

const app = require( '@openagenda/test-app' )( {
  frontWrapper: __dirname + '/front.js',
  excludeDefaultStyles: true,
  styles: [
    __dirname + '/../../node_modules/@openagenda/bs-templates/compiled/main.css'
  ],
  webpack: true,
  babelServer: true
} );

config.interfaces.events = require( './eventSearch.interface' );

config.interfaces.suggestions = require( './eventSuggestions.interface' );

app.get( /\/(events|suggestions)/, ( req, res, next ) => { setTimeout( () => { next(); } , 2000 ); } );


app.get( '/events', ( req, res, next ) => { 

  req.agendaId = 123;

  next();

} );

app.get( '/events', svc.mw.events );


app.get( '/suggestions', ( req, res, next ) => { 

  req.agendaUid = 456;

  next();

} );

app.get( '/suggestions', svc.mw.suggestions );

app.get( /\/(events|suggestions)/, ( req, res ) => res.json( req.events ) );

svc.init( config, () => app.getAndListen() );