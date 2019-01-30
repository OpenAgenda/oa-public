"use strict";

const _ = require( 'lodash' );
const bodyParser = require( 'body-parser' );
const express = require( 'express' );
const fs = require( 'fs' );

const app = express();

const DELAY = 500;

const fixtures = {
  search: JSON.parse( fs.readFileSync( __dirname + '/referencesSearch.json', 'utf-8' ) ),
  suggestions: JSON.parse( fs.readFileSync( __dirname + '/referencesSuggestions.json', 'utf-8' ) )
}

module.exports = app;

app.use( ( req, res, next ) => { setTimeout( next, DELAY ) } );

app.get( '/', ( req, res, next ) => {

  console.log( 'references test app', req.url, req.query );

  let events = [];

  if ( req.query.uid ) {

    events = fixtures.search.filter( e => req.query.uid.includes( e.uid + '' ) );

  } else if ( req.query.sample ) {

    events = fixtures.suggestions;

  } else {

    events = fixtures.search;

  }

  if ( req.query.exclude ) {

    events = events.filter( e => !req.query.exclude.includes( e.uid + '' ) );

  }

  res.json( { events } );

} );
