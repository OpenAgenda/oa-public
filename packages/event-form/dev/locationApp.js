"use strict";

const _ = require( 'lodash' );
const bodyParser = require( 'body-parser' );
const express = require( 'express' );
const fs = require( 'fs' );

// to see them loaders do their thing
const DELAY = 500;

const fixtures = {
  index: JSON.parse( fs.readFileSync( __dirname + '/locationList.json', 'utf-8' ) ),
  suggestions: JSON.parse( fs.readFileSync( __dirname + '/locationSuggestions.json', 'utf-8' ) ),
  geocode: JSON.parse( fs.readFileSync( __dirname + '/geocode.json', 'utf-8' ) )
}

const app = express();

app.use( bodyParser.json() );

module.exports = app;

app.use( ( req, res, next ) => { setTimeout( next, DELAY ) } );

app.get( '/', ( req, res ) => {

  if ( req.query.uids ) {

    res.json( _.set( fixtures.index, 'items', 
      fixtures.index.items.filter( l => req.query.uids.includes( l.uid ) )
    ) );

  } else {

    res.json( fixtures.index );

  }

} );

app.get( '/geocode', ( req, res ) => {

  res.json( fixtures.geocode );

} );

app.post( '/', ( req, res ) => {

  res.send( {
    success: true,
    location: _.extend( req.body, { uid: req.body.uid || Math.ceil( Math.random() * 99999999 ) } )
  } );

} );