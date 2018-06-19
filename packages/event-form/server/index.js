"use strict";

const _ = require( 'lodash' );

const express = require( 'express' );

const app = express();

module.exports = {
  app,
  init: c => _.extend( config, c )
}

const config = {
  layout: content => content
}

app.get( '/', ( req, res ) => {

  res.send( config.layout( req, '<div id="app"></div><script src="/js/app.js"></script>' ) );

} );