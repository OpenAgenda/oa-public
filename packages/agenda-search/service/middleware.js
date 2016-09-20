"use strict";

let logger = require( 'basic-logger' ), log,

getLabel = require( 'labels' )( require( 'labels/agenda-search/index' ) ),

validators = require( 'validators' ),

service, config,

url = require( './url' ),

validatePage = validators.number( {
  min: 1,
  default: 1
} ),

utils = require( 'utils' ),

React = require( 'react' ),

ReactDOMServer = require( 'react-dom/server' ),

rss = require( 'rss' ),

Body = React.createFactory( require( '../components/lib/Body.js' ) );

module.exports = {
  init,
  rebuild,
  list
}


function rebuild( req, res, next ) {

  if ( req.log ) req.log( 'info', 'starting agenda search index rebuild' );

  service.rebuild( err => {

    if ( err ) {

      req.log( 'error', 'errored during agenda search rebuild: %s', JSON.stringify( err ) );

    } else {

      req.log( 'info', 'completed agenda search index rebuild' );

    }

  } );

  next();

}


function list( req, res, next ) {

  let limit = config.limit.default,

  offset = 0,

  page = 1,

  search = req.query.search || null, 

  official = req.query.official !== undefined ? !!parseInt( req.query.official ) : null;

  try {

    page = validatePage( req.query.page );

    offset = ( page - 1 ) * limit;

  } catch( e ) {}

  service.list( {
    search,
    official,
  }, offset, limit, ( err, agendas, total ) => {

    if ( err ) return next( err );

    req.data = {
      total,
      offset,
      limit,
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
      page,
      search,
      official,
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