"use strict";

var logger = require( 'basic-logger' ), log,

validators = require( 'validators' ),

service, config,

validatePage = validators.number( {
  min: 1,
  default: 1
} ),

utils = require( 'utils' ),

React = require( 'react' ),

ReactDOMServer = require( 'react-dom/server' ),

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

  page = 1;

  try {

    page = validatePage( req.query.page );

    offset = ( page - 1 ) * limit;

  } catch( e ) {}

  service.list( req.query.oas || {}, offset, limit, ( err, agendas, total ) => {

    if ( err ) return next( err );

    req.data = {
      agendas: agendas,
      total: total
    }

    if ( req.xhr ) return res.json( req.data );

    req.content = ReactDOMServer.renderToString( Body( {
      lang: req.lang,
      page: page,
      query: req.query.oas,
      agendas: agendas,
      total: total
    } ) );

    next();

  } );

}

function init( s, c ) {

  service = s;

  config = utils.extend( {
    limit: {
      default: 20,
      max: 100
    }
  }, c.mw || {} );

}