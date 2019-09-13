"use strict";

const express = require( 'express' );
const bodyParser = require( 'body-parser' );

const app = express();

module.exports = app
  .set( 'trust proxy', 'loopback' )
  .use( bodyParser.json( { limit: '5mb' } ) )
  .use( bodyParser.urlencoded( { limit: '500kb', extended: true } ) )
  .use( ( req, res, next ) => {
    req.app = app;
    res.setHeader( 'X-Powered-By', 'OpenAgenda' );
    next();
  } );
