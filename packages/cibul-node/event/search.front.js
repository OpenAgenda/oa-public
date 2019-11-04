"use strict";

const ih = require( 'immutability-helper' );
const sessions = require( '@openagenda/sessions' );
const cmn = require( '../lib/commons-app' );

module.exports = app => {

  app.get( '/events/search/?*?', sessions.middleware.ifUnlogged( ( req, res ) => res.redirect( 302, '/' ) ) );

  app.get( '/events/search', ( req, res, next ) => {
    const search = app.services.eventSearch.events;

    const options = _defineOptions( req.query ); // this is cleaned in search.

    const p = search( req.query, req.query, options );

    p.catch( next );

    p.then( result => cmn.renderJson( req, res, result ) );

  } );

  app.get( '/events/search/aggs', ( req, res, next ) => {

    const options = _defineOptions( req.query, true );

    const p = search( req.query, { size: 0 }, options );

    p.catch( next );

    p.then( result => cmn.renderJson( req, res, result ) );

  } );

  app.get( '/events/search/rebuild',
    cmn.requireSuperAdmin,
    ( req, res ) => {
      const search = app.services.eventSearch.events;

      search.rebuild().then( () => { console.log( 'done' ); } );

      res.send( 'rebuilding' );

    }
  );

}


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
