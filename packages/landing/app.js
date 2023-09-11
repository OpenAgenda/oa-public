"use strict";

const express = require( 'express' );

const app = express();

const server = require( 'http' ).createServer( app );

const pages = require( './' );

const fs = require( 'fs' );

const reload = require( 'reload' );

const port = process.env.PORT || 3000;

const style = fs.readFileSync( __dirname + '/node_modules/@openagenda/bs-templates/compiled/main.css' );

app.get( /css$/, ( req, res, next ) => {

  res.type( 'text/css' );
  res.send( style );

} );

app.get( /ico$/, ( req, res, next ) => { res.send( 'favicon' ) } );

app.get( '/', ( req, res, next ) => {

  req.optionalData = {
    events: '12 345',
    agendas: '83 929',
    contributors: '98 908'
  }

  next();

} );

app.get( [ '/:page', '/' ], ( req, res, next ) => {

  let p = pages( 'http://' + req.hostname + ':' + port ); // reload the thing  

  let page = req.params.page || null;

  try {

    req.content = p( page ).render( req.optionalData );

    req.headPart = p( page ).getHeadPart();

    next();

  } catch ( e ) {

    console.log( e );

    next( 404 );

  }


} );

app.use( '/fonts', express.static( __dirname + '/node_modules/font-awesome/fonts' ) );

reload( server, app );

app.get( '*', ( req, res ) => {

  let layout = fs.readFileSync( __dirname + '/layout.html', 'utf-8' );

  res.type( 'text/html' );

  if ( !req.content ) {

    req.content = 'no content is defined';

  }

  res.send( layout.replace( '<!--content-->', req.content ).replace('<!--head-->', req.headPart ) );

} );


server.listen( port, '0.0.0.0' );
