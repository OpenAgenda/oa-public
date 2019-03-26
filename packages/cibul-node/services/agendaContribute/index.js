"use strict";

const _ = require( 'lodash' );

const agendas = require( '@openagenda/agendas' );
const contribute = require( '@openagenda/agenda-contribute' );
const sessions = require( '@openagenda/sessions' );

const layout = require( '../lib/layouts' ).agenda;

const cmn = require( '../../lib/commons-app' );

const middlewares = require( './middlewares' );
const interfaces = require( './interfaces' );

const base64 = require( '@openagenda/utils/base64' );

let bucket;

module.exports = _.extend( ( parentApp, path = '' ) => {

  parentApp.use( '/dist/contribute',
    contribute.dist,
    ( req, res, next ) => res.send( 404 ) // if not, unhandled files will be handled by following routes
  );

  parentApp.all( [
    '/:agendaSlug/contribute',
    '/:agendaSlug/contribute/:step',
    '/:agendaSlug/contribute/event/:eventUid',
    '/:agendaSlug/contribute/event/:eventUid/draft'
  ], [
    agendas.middleware.load( {
      namespaces: {
        identifiers: { slug: 'params.agendaSlug' }
      },
      private: null,
      internal: true // required for stakeholders service
    } ),
    ( req, res, next ) => _.get( req, 'agenda' ) ? next() : cmn.errorResponse( req, res, { code: 404 } ),
    sessions.middleware.ifUnlogged( ( req, res ) => res.redirect( 302, `/${req.agenda.slug}/signup?redirect=${base64.encode( req.originalUrl )}` ) ),
    middlewares.member,
    middlewares.schemaExtensions,
    middlewares.duplicateFromEvent
  ] );

  parentApp.all( [
    '/:agendaSlug/contribute/event/:eventUid',
    '/:agendaSlug/contribute/event/:eventUid/draft'
  ], middlewares.event );

  parentApp.get( '/:agendaSlug/contribute/event/:eventUid', middlewares.defineUpdateRedirect );

  parentApp.all( [
    '/:agendaSlug/contribute',
    '/:agendaSlug/contribute/:step',
    '/:agendaSlug/contribute/event/:eventUid',
    '/:agendaSlug/contribute/event/:eventUid/draft'
  ], ( req, res, next ) => {

    req.config = {
      lang: req.lang,
      base: `/${req.agenda.slug}/contribute`,
      edit: _.get( req, 'event.uid' ) && !_.get( req, 'event.draft' ),
      locationRes: `/${req.agenda.slug}/locations`,
      referencesRes: req.params.eventUid ? `/agendas/${req.agenda.uid}/events/${req.params.eventUid}/references`: null,
      suggestionsRes: req.params.eventUid ? `/agendas/${req.agenda.uid}/events/${req.params.eventUid}/suggestions` : `/agendas/${req.agenda.uid}/events/suggestions`,
      fileStore: { type: 's3', bucket },
      redirects: {
        updated: req.updateRedirect,
        seeEvent: `/agendas/${req.agenda.uid}/events/:eventUid`,
        createOtherEvent: `/${req.agenda.slug}/contribute`,
        seeAllEvents: `/home/events`,
        contactAdministrators: req.params.eventUid ? `/agendas/${req.agenda.uid}/events/:eventUid/contact` : `/${req.agenda.slug}/contact`,
        draft: `/home/events`
      },
      member: {
        dataIsRequired: _.get( req, 'agenda.settings.contribution.useFields', false )
      },
      event: {
        message: _.get( req, 'agenda.settings.contribution.messages.instructions' )
      },
      confirmation: {
        message: _.get( req, 'agenda.settings.contribution.messages.complete' ),
        state: _.get( req, 'agenda.settings.contribution.defaultState', 2 )
      }
    }

    next();

  } );

  parentApp.use( '/:agendaSlug/contribute', contribute.app );

}, {
  init
} );

function init( config ) {

  bucket = config.aws.bucket;

  contribute.init( {
    logger: config.getLogConfig( 'svc', 'agendaContribute' ),
    CDNPath: config.aws.servicesBucketPath,
    frontAppPath: process.env.NODE_ENV !== 'production' ? '/dist/contribute' : null,
    layout,
    middlewares,
    interfaces
  } );

}
