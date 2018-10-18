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

  // if a sample is provided, suggestions are returned
  if ( req.query.sample ) return res.json( fixtures.suggestions );

  res.json( fixtures.search );

} );
