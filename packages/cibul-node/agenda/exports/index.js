"use strict";

const _ = require( 'lodash' );
const agendas = require( '@openagenda/agendas' );
const csv = require( '@openagenda/flat-exports' ).csv();
const ICSStream = require( '@openagenda/flat-exports' ).ICSStream;
const labels = require( '@openagenda/labels/event/exportFieldNames' );
const MarkdownStream = require( '@openagenda/flat-exports' ).MarkdownStream;
const xlsx = require( '@openagenda/flat-exports' ).xlsx();
const rss = require( './rss' );


module.exports = app => {

  app.get(
    '/agendas/:agendaUid/events.v2.(csv|xlsx|ics|rss|txt|md)',
    agendas.middleware.load( { private: null, namespaces: { identifiers: { uid: 'params.agendaUid' } } } )
  );


  rss( app, '/agendas/:agendaUid/events.v2.rss' );


  app.get( '/agendas/:agendaUid/events.v2.(csv|xlsx|ics|txt|md)', async ( req, res, next ) => {

    const result = await app.services.eventSearch.agendas( req.params.agendaUid ).search( req.query, { size: 0 }, {
      aggregations: [ 'languages' ]
    } );

    // here options must be separated from
    req.stream = await app.services.eventSearch.agendas( req.params.agendaUid ).stream( req.query, { detailed: true } );

    // this should be loaded from some agenda cache
    req.languages = result.aggregations.languages.map( b => b.key );

    next();

  } );


  app.get( '/agendas/:agendaUid/events.v2.xlsx', ( req, res, next ) => {

    xlsx( req.stream, {
      lang: req.lang,
      languages: req.languages,
      labels
    } ).pipe( res );

    res.writeHead( 200, {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-disposition' : `attachment; filename="${req.agenda.slug}.agenda.xlsx"`
    } );

  } );

  app.get( '/agendas/:agendaUid/events.v2.csv', ( req, res, next ) => {

    csv( req.stream, {
      lang: req.lang,
      languages: req.languages,
      labels
    } ).pipe( res );

    res.writeHead( 200, {
      'Content-Type' : 'text/csv',
      'Content-disposition' : `attachment; filename="${req.agenda.slug}.agenda.csv"`
    } );

  } );

  app.get( '/agendas/:agendaUid/events.v2.(txt|md)', async ( req, res, next ) => {

    const extension = req.originalUrl.split( '?' ).shift().split( '.' ).pop();

    res.writeHead( 200, {
      'Content-Type' : 'text/plain',
      'charset': 'utf-8',
      'Content-disposition' : `attachment; filename="${req.agenda.slug}.agenda.${extension}"`
    } );

    const stream = new MarkdownStream( {
      format: extension,
      section: _getFirstSortField( req.query ),
      lang: req.lang,
      slug: req.agenda.slug,
      identifier: req.agenda.uid,
      title: req.agenda.title,
      description: req.agenda.description,
      genUrl: e => 'https://openagenda.com/' + req.agenda.slug + '/events/' + e.slug
    } );

    req.stream.pipe( stream ).pipe( res );

  } );

  app.get( '/agendas/:agendaUid/events.v2.ics', ( req, res, next ) => {

    res.writeHead( 200, {
      'Content-Type' : 'text/calendar'
    } );

    const stream = new ICSStream( {
      lang: req.lang,
      slug: req.agenda.slug,
      identifier: req.agenda.uid,
      title: req.agenda.title,
      description: req.agenda.description
    } );

    req.stream.pipe( stream ).pipe( res );

  } );


  app.get( '/agendas/:agendaUid/events.v2.rss', ( req, res, next ) => {

    // get first?

    res.send( 'rss data' );

  } );

};


function _getFirstSortField( query ) {

  const firstSort = _.head( query.sort, null );

  if ( !firstSort ) return null;

  const parts = firstSort.split( '.' );

  parts.pop();

  return parts.join( '.' );

}
