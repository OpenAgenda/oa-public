"use strict";

const _ = require( 'lodash' );
const express = require( 'express' );
const fs = require( 'fs' );

const config = require( './config' );
const app = express();

let render;

module.exports = {
  init: c => {

    config.init( c );

    render = _.template( fs.readFileSync( __dirname + '/canvas.ejs', 'utf-8' ) );

  },
  app,
  dist: express.static( __dirname + '/../client/dist' )
}

app.get( '/', ( req, res, next ) => {

  if ( !req.agendaUid ) {

    return next( 'agendaUid is missing in request' );

  }

  const renderedCanvas = render( {
    frontAppPath: _.get( config, 'frontAppPath', 'dist' ),
    config: JSON.stringify( {
      agendaUid: req.agendaUid,
      lang: req.lang || 'fr',
      res: _.extend( {
        agenda: null,
        search: null,
        event: null
      }, config.res )
    } )
  } );

  res.send( config.layout( req, renderedCanvas ) );

} );