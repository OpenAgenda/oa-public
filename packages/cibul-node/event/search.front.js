"use strict";

const app = require( 'express' )();

const search = require( '../services/eventSearch' ).events;

const cmn = require( '../lib/commons-app' );

const ih = require( 'immutability-helper' );

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

  p.then( result => cmn.renderJson( req, res, result ) );

} );

app.get( '/aggs', ( req, res, next ) => {

  const p = search( req.query, { size: 0 }, ih( req.query, { aggregations: { $set: [ 'keywords', 'timingsByMonth', 'location.region', 'location.city' ] } } ) );

  p.catch( next );

  p.then( result => cmn.renderJson( req, res, result ) );

} );

app.get( '/rebuild', ( req, res, next ) => {

  search.rebuild().then( () => { console.log( 'done' ); } );

  res.send( 'rebuilding' );

} );