"use strict";

const app = require( 'express' )();

const surveysApp = require( '@openagenda/surveys/server' ).app;
const { middleware: agendasMw } = require( '@openagenda/agendas' );

module.exports = ( parentApp, path ) => {

  parentApp.use( path, app );

}

app.param( 'agendaSlug', agendasMw.load( {
  namespaces: {
    identifiers: {
      slug: 'params.agendaSlug'
    },
    result: 'agenda'
  },
  internal: true,
  private: null
} ) );

app.post( '/:agendaSlug/survey', ( req, res, next ) => {

  req.decorate = {
    agenda: _.pick( req.agenda, [ 'uid', 'slug' ] )
  }

  next();

} );

app.use( '/:agendaSLug/survey', surveysApp );