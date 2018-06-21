"use strict";

const _ = require( 'lodash' );
const app = require( 'express' )();
const ih = require( 'immutability-helper' );

const sessions = require( '@openagenda/sessions' );

const cmn = require( '../lib/commons-app' );
const search = require( '../services/eventSearch' ).events;

module.exports = ( parentApp, path ) => {

  parentApp.use( path, app );

}

app.get( '/*', [
  sessions.middleware.ifUnlogged( cmn.redirectTo() ),
  cmn.requireAdmin
] );

app.get( '/', ( req, res, next ) => {

  const options = _defineOptions( req.query ); // this is cleaned in search.

  const p = search( req.query, req.query, options );

  p.catch( next );

  p.then( result => cmn.renderJson( req, res, result ) );

} );

app.get( '/aggs', ( req, res, next ) => {

  const options = _defineOptions( req.query, true );

  const p = search( req.query, { size: 0 }, options );

  p.catch( next );

  p.then( result => cmn.renderJson( req, res, result ) );

} );

app.get( '/rebuild', ( req, res, next ) => {

  search.rebuild().then( () => { console.log( 'done' ); } );

  res.send( 'rebuilding' );

} );


function _defineOptions( query, forceAggs = false ) {

  if ( forceAggs || query.aggs || query.cal ) {

    const update = { aggregations: { $set: [
      'agendas',
      'keywords',
      'timingsByMonth',
      'location.region', 
      'location.city',
      'location.name',
    ] } };

    if ( query.cal ) {

      update.aggregations[ '$set' ].push( 'eventsByDay' );

    }

    return ih( query, update );

  }

  return query;

}