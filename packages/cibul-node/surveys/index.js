"use strict";

const _ = require( 'lodash' );
const app = require( 'express' )();

const service = require( '@openagenda/surveys/server' );
const { middleware: agendasMw } = require( '@openagenda/agendas' );
const flattenLabels = require( '@openagenda/labels/flatten' );
const headerLabels = require( '@openagenda/labels/layout/header' );

module.exports = ( parentApp, path = '' ) => {

  parentApp.use( '/dist/surveys', service.dist );

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

app.get( '/:agendaSlug/survey/:eventSlug', ( req, res, next ) => {

  req.decorate = {
    config: {
      res: {
        redirect: {
          $set: `/${req.params.agendaSlug}/events/${req.params.eventSlug}`
        }
      }
    },
    agenda: {
      $set: req.agenda
    },
    lang: {
      $set: req.lang
    },
    labels: {
      $set: flattenLabels( headerLabels, req.lang )
    }
  }

  next();

} );

app.post( '/:agendaSlug/survey/:eventSlug', ( req, res, next ) => {

  req.decorate = { agenda: { $set: _.pick( req.agenda, [ 'slug', 'uid' ] ) } }

  next();

} );

app.use( '/:agendaSlug/survey/:eventSlug', service.app );