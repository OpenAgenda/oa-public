"use strict";

const app = require( 'express' )();

const search = require( '../services/eventSearch' ).events;

const cmn = require( '../lib/commons-app' );

const sessions = require( 'sessions' );

module.exports = ( parentApp, path ) => {

  parentApp.use( path, app );

}

app.get( '/*', [ 
  sessions.middleware.ifUnlogged( cmn.redirectTo() ),
  cmn.requireAdmin
] );

app.get( '/', ( req, res, next ) => {

  const p = search( req.query, req.query, req.query );

  p.catch( next );

  p.then( result => res.json( result ) );

} );

app.get( '/rebuild', ( req, res, next ) => {

  search.rebuild().then( () => { console.log( 'done' ); } );

  res.send( 'rebuilding' );

} );