"use strict";

var express = require( 'express' );

const app = express(),

  server = require( 'http' ).createServer( app ),

  templatesBase = __dirname + '/templates',

  recursiveListPaths = require( './scripts/recursiveListPaths' ),

  reload = require( 'reload' ),

  renderEjs = require( './scripts/renderEjs' ),

  sassify = require( './scripts/sassify' ),

  fs = require( 'fs' );


/**
 * templates index
 */
app.get( '/', ( req, res, next ) => {

  recursiveListPaths( __dirname + '/templates', /^[^_].+\.ejs$/, ( err, paths ) => {

    if ( err ) return next( err );

    req.templatePaths = paths;

    res.send( [
      '<html>',
      '<head></head>',
      '<body>',
      '<h1>Templates list</h1>',
      '<ul>',
      paths.map( p => '<li><a href="' + p + '">' + p + '</a></li>' ).join( '' ),
      '</ul></body>',
      '</html>'
    ].join( '' ) );

  } );

} );

reload( server, app );


/**
 * render ejs template
 */
app.get( /ejs$/, ( req, res, next ) => {

  res.send( 
    renderEjs( templatesBase + req.path )
    .replace( '</head>', '<script src="/reload/reload.js"></script></head>' )
  );

} );

app.use( '/fonts', express.static( __dirname + '/node_modules/font-awesome/fonts' ) );


/**
 * render styles
 */

app.get( /css$/, ( req, res, next ) => {

  sassify.render( templatesBase + req.path.replace( '.css', '.scss' ), ( err, css ) => {

    if ( err ) return next( err );

    res.type( 'text/css' );

    res.send( css );

  } );

} );

/**
 * images
 */

app.get( /(png|jpg|jpeg|svg|eot|ttf|woff)$/, ( req, res, next ) => {

  let stream = fs.createReadStream( templatesBase + req.path );

  res.set( 'Content-Type', ( {
    png: 'image/png',
    jpg: 'image/jpg',
    jpeg: 'image/jpeg',
    svg: 'image/svg+xml',
    eot: 'application/vnd.ms-fontobject',
    ttf: 'application/font-sfnt',
    woff: 'application/font-woff'
  } )[ req.path.split( '.' ).pop() ] );

  stream.on( 'open', () => {

    stream.pipe( res );

  } );

  stream.on( 'error', err => {

    console.error( err );

  } );

  stream.on( 'end', () => {

    res.end();

  } );

} );

server.listen( process.env.PORT || 3000 );