"use strict";

var express = require( 'express' );

var app = express(),

templatesBase = __dirname + '/templates',

recursiveListPaths = require( './scripts/recursiveListPaths' ),

renderEjs = require( './scripts/renderEjs' ),

sassify = require( './scripts/sassify' );


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


/**
 * render ejs template
 */
app.get( /ejs$/, ( req, res, next ) => {

  res.send( renderEjs( templatesBase + req.path ) );

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

  });

} );

app.listen( 3000 );