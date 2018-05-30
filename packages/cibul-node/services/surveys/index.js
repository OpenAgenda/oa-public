"use strict";

const _ = require( 'lodash' );
const app = require( 'express' )();

const fs = require( 'fs' );

const surveys = require( '@openagenda/surveys/server' );
const { middleware: agendasMw } = require( '@openagenda/agendas' );

const layout = require( '../lib/layout' );

module.exports = _.extend( ( parentApp, path ) => {

  parentApp.use( '/dist/surveys', surveys.dist );

  parentApp.use( path, app );  

}, { init } )

function init( config ) {

  surveys.init( {
    knex: config.knex,
    schema: 'survey',
    decorateKey: 'decorate',
    layout
  } );

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
    }
  }

  next();

} );

app.post( '/:agendaSlug/survey/:eventSlug', ( req, res, next ) => {

  req.decorate = { agenda: { $set: _.pick( req.agenda, [ 'slug', 'uid' ] ) } }

  next();

} );

app.use( '/:agendaSlug/survey/:eventSlug', surveys.app );