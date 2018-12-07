"use strict";

const utils = require( '@openagenda/utils' );
const React = require( 'react' );
const ReactDOMServer = require( 'react-dom/server' );
const rss = require( 'rss' );

const log = require( '@openagenda/logs' )( 'middleware' );

const getLabel = require( '@openagenda/labels' )( require( '@openagenda/labels/agenda-search/index' ) );

const url = require( './url' );
const validators = require( '../validators' );

const Body = React.createFactory( require( '../components/lib/Body.js' ) );

let service, config;

module.exports = {
  init,
  rebuild,
  update,
  list
}


async function rebuild( req, res, next ) {

  if ( req.log ) log( 'info', 'starting agenda search index rebuild' );

  next();

  service.rebuild().then( () => {

    log( 'info', 'completed agenda search index rebuild' )

  }, err => {

    log( 'error', 'errored during agenda search rebuild', err );

  } );

}


async function update( req, res, next ) {

  if ( req.log ) log( 'info', 'starting agenda search index update' );

  next();

  service.resyncUpdated().then( ( { indexed, updated } ) => {

    log( 'info', 'completed agenda search index update with %s updates and %s indexes', updated, indexed );

  }, err => {

    log( 'error', 'errored during agenda search update', err );

  } );

}


function list( req, res, next ) {

  let nav, query;

  try {

    nav = validators.nav( req.query );

    query = validators.query( req.query );

  } catch ( errors ) {

    res.status( 400 );

    return next( errors.map( e => e.message ).join( ', ' ) );

  }

  service.list( query, nav.offset, nav.limit, ( err, agendas, total ) => {

    if ( err ) return next( err );

    req.data = {
      offset: nav.offset,
      limit: nav.limit,
      total,
      agendas
    }

    if ( req.params.format === 'json' ) {

      return res.json( req.data );

    }

    if ( req.params.format === 'rss' ) {

      return _renderRss( req, res );

    }

    req.content = ReactDOMServer.renderToString( Body( {
      lang: req.lang,
      page: nav.page,
      query,
      agendas,
      total
    } ) );

    next();

  } );

}


function _renderRss( req, res ) {

  let today = new Date();

  today.setHours( 0, 0, 0, 0 );

  let feed = new rss( {
    title: getLabel( 'genericSearchTitle', req.lang ),
    feed_url: config.site.url + req.originalUrl,
    site_url: 'https://' + req.get( 'host' ),
    generator: 'OpenAgenda',
    image_url: config.site.image,
    pubDate: today,
    language: req.lang,
    ttl: 24*60
  } );

  req.data.agendas.forEach( a => {

    feed.item( {
      title: a.title,
      description: a.description,
      url: url.agenda( a, config.site.url ),
      guid: a.uid,
      date: a.createdAt
    } );

  } ) ;

  res.set( 'Content-Type', 'application/rss+xml' );

  res.send( feed.xml() );

}


function init( s, c ) {

  service = s;

  config = utils.extend( {
    limit: {
      default: 20,
      max: 100
    }
  }, c.mw || {} );

  config.site = c.site;

}
