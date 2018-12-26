"use strict";

const { buildCss, appendCssBuildMiddleware } = require( './css' );

const compileParsers = require( './parsers/compile' );
const detailedParseEvent = require( './parsers/detailed' );

module.exports = ( app, port = 80 ) => {

  app.listen( port, () => ( process.env.NODE_ENV === 'development' ? _development : _production )( app, port ) );

  app.locals.root = _setRoot( app, port );

  app.set( 'parsers', {
    event: compileParsers( app.locals ),
    detailedEvent: detailedParseEvent( { lang: app.locals.lang } )
  } );

}

module.exports.applyDevelopmentMiddleware = app => {

  const { sass, assets } = app.locals;

  appendCssBuildMiddleware( app, sass || __dirname + '/../sass/main.scss', assets || __dirname + '/../assets' );

  app.get( '/error', ( req, res, next ) => next( new Error( 'Made up error' ) ) );

}

function _development( app, port ) {

  if ( process.send ) process.send( 'online' );

}

function _production( app, port ) {

  if ( !app.locals.config.root ) throw new Error( 'app root is not set' );

  const { sass, assets } = app.locals;

  buildCss( sass || __dirname + '/../sass/main.scss', assets || __dirname + '/../assets' );

}

function _setRoot( app, port ) {

  if ( process.env.NODE_ENV === 'development' ) {

    return 'http://localhost:' + port

  }

  return app.locals.config.root;

}
