"use strict";

const _ = require( 'lodash' );

const { middleware: agendasMw } = require( '@openagenda/agendas' );
const service = require( '@openagenda/agenda-calendar-apps' );

const layout = require( '../lib/layout' );

module.exports = _.extend( ( parentApp, path ) => {

  parentApp.use( '/dist/calendar', service.dist );

  parentApp.get( path + '/:agendaSlug/calendar', [ agendasMw.load( {
    namespaces: {
      identifiers: {
        slug: 'params.agendaSlug'
      },
      result: 'agenda'
    },
    internal: true,
    private: null
  } ), ( req, res, next ) => {

    req.agendaUid = req.agenda.uid

    next();

  } ] );

  parentApp.use( path + '/:agendaSlug/calendar', service.app );

}, { init } );


function init( config ) {

  service.init( {
    frontAppPath: '/dist/calendar',
    res: {
      agenda: `${config.root}/agendas/{agendaUid}`,
      search: `${config.root}/agendas/{agendaUid}/events.v2.json`,
      event: `${config.root}/agendas/{agendaUid}/events/{eventUid}`
    },
    layout
  } );

}