"use strict";

const _ = require( 'lodash' );
const { middleware: agendasMw } = require( '@openagenda/agendas' );
const service = require( '@openagenda/agenda-calendar-apps' );
const layout = require( '../lib/layouts' ).agenda;
const config = require('../../config');

module.exports = _.extend( app => {

  app.use( '/dist/calendar', service.dist );

  app.get(
    '/:agendaSlug/calendar',
    agendasMw.load( {
      namespaces: {
        identifiers: {
          slug: 'params.agendaSlug'
        },
        result: 'agenda'
      },
      internal: true,
      private: null
    } ),
    ( req, res, next ) => {

      req.agendaUid = req.agenda.uid

      req.translateMode = Boolean(req.cookies.translateMode);
      req.isTranslator = req.user?.uid && config.translators.includes(req.user.uid);

      if (req.cookies.translateMode) {
        req.scripts = {
          top: [
            { body: 'window._jipt = [[\'project\', \'openagenda\']];' },
            { src: '//cdn.crowdin.com/jipt/jipt.js' }
          ]
        };
      }

      next();

    }
  );

  app.use( '/:agendaSlug/calendar', service.app );

}, { init } );


function init( config ) {

  service.init( {
    frontAppPath: process.env.NODE_ENV==='production' ? config.aws.servicesBucketPath + 'agenda-calendar-apps' : '/dist/calendar',
    res: {
      agenda: `${config.root}/agendas/{agendaUid}`,
      search: `${config.root}/agendas/{agendaUid}/events.v2.json`,
      event: `${config.root}/agendas/{agendaUid}/events/{eventUid}`
    },
    layout: ( req, content ) => layout( content, req )
  } );

}
