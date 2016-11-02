"use strict";

const express = require( 'express' );

const app = express();

const pages = require( './' );

const fs = require( 'fs' );

const port = process.env.PORT || 3000;

const style = fs.readFileSync( __dirname + '/node_modules/bs-templates/compiled/main.css' );

app.get( /css$/, ( req, res, next ) => {

  res.type( 'text/css' );
  res.send( style );

} );

app.get( /ico$/, ( req, res, next ) => { res.send( 'favicon' ) } );

app.get( '/:page', ( req, res, next ) => {

  let p = pages( 'http://' + req.hostname + ':' + port ); // reload the thing  

  req.content = p( req.params.page ).render();

  next();

} );

app.use( '/fonts', express.static( __dirname + '/node_modules/font-awesome/fonts' ) );

app.get( '*', ( req, res ) => {

  let layout = fs.readFileSync( __dirname + '/layout.html', 'utf-8' );

  res.type( 'text/html' );

  if ( !req.content ) {

    req.content = 'no content is defined';

  }

  res.send( layout.replace( '{content}', req.content ) );

} );

app.listen( port );