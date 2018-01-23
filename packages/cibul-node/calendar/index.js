"use strict";

const _ = require( 'lodash' );
const app = require( 'express' )();

const { middleware: agendasMw } = require( '@openagenda/agendas' );
const flattenLabels = require( '@openagenda/labels/flatten' );
const headerLabels = require( '@openagenda/labels/layout/header' );
const sessions = require( '@openagenda/sessions' );

const config = require( '../config' );

const canvas = _.template( require( 'fs' ).readFileSync( __dirname + '/canvas.tpl', 'utf-8' ) );


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

app.get( '/:agendaSlug/calendar', ( req, res, next ) => {

  res.send( canvas( {
    agenda: req.agenda,
    lang: req.lang,
    labels: flattenLabels( headerLabels, req.lang ),
    res: {
      agenda: `${config.root}/agendas/{agendaUid}`,
      search: `${config.root}/agendas/{agendaUid}/events.v2.json`,
      event: `${config.root}/agendas/{agendaUid}/events/{eventUid}`
    }
  } ) );

} );