"use strict";

const path = require( 'path' );
const morgan = require( 'morgan' );
const log = require( '@openagenda/logs' )( 'incoming' );


const blacklist = [
  /^\/legacy/
];

morgan.token( 'path', req => req.path );

morgan.token( 'key', req => req.query.key );

morgan.token( 'query', req => JSON.stringify( req.query ) );

morgan.token( 'content-length', ( req, res ) => res[ 'content-length' ] && humanSize( res[ 'content-length' ], 2 ) );

morgan.token( 'extension', req => path.extname( req.originalUrl ) );


function init( config ) {

  log.setConfig( config.getLogConfig( 'oa', 'requests' ) );

}

const middleware = morgan(
  ( tokens, req, res ) => {
    const statusCode = headersSent( res )
      ? res.statusCode
      : undefined

    // get status color
    const color = statusCode >= 500 ? 31 // red
      : statusCode >= 400 ? 33 // yellow
        : statusCode >= 300 ? 36 // cyan
          : statusCode >= 200 ? 32 // green
            : 0 // no color

    const query = tokens.query( req, res );

    const data = {
      ip: tokens[ 'remote-addr' ]( req, res ),
      method: tokens.method( req, res ),
      path: tokens.path( req, res ),
      url: tokens.url( req, res ),
      httpVersion: tokens[ 'http-version' ]( req, res ),
      query,
      key: query.key || null,
      extension: tokens.extension( req, res ),
      status: parseInt( tokens.status( req, res ) ),
      contentLength: tokens[ 'content-length' ]( req, res ),
      responseTime: tokens[ 'response-time' ]( req, res )
    };

    if ( process.env.NODE_ENV === 'production' ) {
      log.info( data );
    } else {
      const { method, url, httpVersion, ip, status, contentLength, responseTime } = data;

      log.info(
        `"${method} ${colored( url, 1 )} HTTP/${httpVersion}"`
        + ` ${ip} ${colored( status, color )} ${contentLength || '-'} ~ ${responseTime}ms`
      );
    }

    return;
  },
  {
    skip: req => blacklist.some( regexp => regexp.test( req.originalUrl ) )
  }
);

function headersSent( res ) {
  return typeof res.headersSent !== 'boolean'
    ? Boolean( res._header )
    : res.headersSent
}

function withColor( txt ) {
  return process.env.NODE_ENV === 'development' ? `\x1b[0m${txt}\x1b[0m` : txt;
}

function colored( txt, color = 0 ) {
  return process.env.NODE_ENV === 'development' ? `\x1b[${color}m${txt}\x1b[0m` : txt;
}

const mags = ' KMGTPEZY';

function humanSize( bytes, precision ) {
  const magnitude = Math.min( Math.log( bytes ) / Math.log( 1024 ) | 0, mags.length - 1 );
  const result = bytes / Math.pow( 1024, magnitude );
  const suffix = mags[ magnitude ].trim() + 'B';

  return result.toFixed( precision ) + suffix;
}


module.exports = {
  init,
  middleware
};
