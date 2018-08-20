"use strict";

const _ = require( 'lodash' );

const agendas = require( '@openagenda/agendas' );
const contribute = require( '@openagenda/agenda-contribute' );
const sessions = require( '@openagenda/sessions' );

const layout = require( '../lib/layout' );

const middlewares = require( './middlewares' );
const interfaces = require( './interfaces' );

module.exports = _.extend( ( parentApp, path ) => {

  parentApp.use( '/dist/contribute', 
    contribute.dist, 
    ( req, res, next ) => res.send( 404 ) // if not, unhandled files will be handled by following routes
  );

  parentApp.all( [ '/:agendaSlug/contribute', '/:agendaSlug/contribute/:step' ], [
    sessions.middleware.load(),
    agendas.middleware.load( {
      namespaces: {
        identifiers: { slug: 'params.agendaSlug' }
      },
      private: null,
      internal: true // required for stakeholders service
    } ),
    middlewares.member
  ] ); 

  parentApp.all( '/:agendaSlug/contribute/:eventUid', middlewares.event );

  parentApp.all( [ '/:agendaSlug/contribute', '/:agendaSlug/contribute/:step' ], ( req, res, next ) => {
    
    req.config = {
      lang: req.lang,
      base: `/${req.agenda.slug}/contribute`,
      member: {
        dataIsRequired: true
      },
      event: {
        message: _.get( req, 'agenda.contribution.messages.instruction' )
      },
      confirmation: {
        message: _.get( req, 'agenda.contribution.messages.complete' )
      }
    }

    next();

  } );

  parentApp.use( '/:agendaSlug/contribute', contribute.app );

}, {
  init
} );

function init( config ) {

  contribute.init( {
    frontAppPath: process.env.NODE_ENV !== 'production' ? '/dist/contribute' : null,
    layout,
    redirects: {
      seeEvent: '/agendas/:agendaUid/events/:eventUid',
      createOtherEvent: '/agendas/:agendaUid/events/contribute',
      seeAllEvents: '/home/events',
      contactAdministrators: '/agendas/:agendaUid/events/:eventUid/contact'
    },
    middlewares,
    interfaces
  } );

}
