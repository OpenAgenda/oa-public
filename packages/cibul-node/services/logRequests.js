"use strict";

const path = require( 'path' );
const morgan = require( 'morgan' );
const log = require( '@openagenda/logs' )( 'incoming' );


const blacklist = [
  /^\/legacy/
];

morgan.token( 'path', req => req.path );

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

    const query = tokens.req( req, res, 'query' );

    const data = {
      ip: tokens[ 'remote-addr' ]( req, res ),
      method: tokens.method( req, res ),
      path: tokens.path( req, res ),
      url: tokens.url( req, res ),
      httpVersion: tokens[ 'http-version' ]( req, res ),
      query,
      key: (query && query.key) || null,
      extension: tokens.extension( req, res ),
      status: parseInt( tokens.status( req, res ) ),
      contentLength: tokens.res( req, res, 'content-length' ),
      responseTime: tokens[ 'response-time' ]( req, res ) || NaN
    };

    if ( process.env.NODE_ENV === 'production' ) {
      log.info( data );
    } else {
      const { method, url, httpVersion, ip, status, contentLength, responseTime } = data;

      log.info( withColor(
        [
          `"${method} ${colored( url, 1 )} HTTP/${httpVersion}"`,
          ip,
          colored( colored( status, color ), 1 ),
          contentLength ? humanSize( contentLength, 2 ) : '-',
          '~',
          `${responseTime}ms`
        ].join( ' ' )
      ) );
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
