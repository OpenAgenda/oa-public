"use strict";

const _ = require( 'lodash' );

const agendas = require( '@openagenda/agendas' );
const contribute = require( '@openagenda/agenda-contribute' );
const sessions = require( '@openagenda/sessions' );

const layout = require( '../lib/layout' );

const cmn = require( '../../lib/commons-app' );

const middlewares = require( './middlewares' );
const interfaces = require( './interfaces' );

let bucket;

module.exports = _.extend( ( parentApp, path ) => {

  parentApp.use( '/dist/contribute', 
    contribute.dist, 
    ( req, res, next ) => res.send( 404 ) // if not, unhandled files will be handled by following routes
  );

  parentApp.all( [ 
    '/:agendaSlug/contribute', 
    '/:agendaSlug/contribute/:step',
    '/:agendaSlug/contribute/event/:eventUid'
  ], [
    sessions.middleware.load(),
    agendas.middleware.load( {
      namespaces: {
        identifiers: { slug: 'params.agendaSlug' }
      },
      private: null,
      internal: true // required for stakeholders service
    } ),
    ( req, res, next ) => _.get( req, 'agenda' ) ? next() : cmn.errorResponse( req, res, { code: 404 } ),
    sessions.middleware.ifUnlogged( ( req, res ) => res.redirect( 302, `/${req.agenda.slug}/signup` ) ),
    middlewares.member
  ] ); 

  parentApp.all( '/:agendaSlug/contribute/event/:eventUid', middlewares.event );

  parentApp.all( [
    '/:agendaSlug/contribute', 
    '/:agendaSlug/contribute/:step',
    '/:agendaSlug/contribute/event/:eventUid'
  ], ( req, res, next ) => {
    
    req.config = {
      lang: req.lang,
      base: `/${req.agenda.slug}/contribute`,
      edit: !!req.event,
      locationRes: {
        index: `/${req.agenda.slug}/locations`,
        geocode: `/${req.agenda.slug}/locations/geocode`,
        set: `/${req.agenda.slug}/locations`
      },
      fileStore: {
        type: 's3',
        bucket
      },
      redirects: {
        //updated: `this should be set when specific redirects are needed on an update`
        seeEvent: `/agendas/${req.agenda.uid}/events/:eventUid`,
        createOtherEvent: `/${req.agenda.slug}/contribute`,
        seeAllEvents: `/home/events`,
        contactAdministrators: `/agendas/${req.agenda.uid}/events/:eventUid/contact`,
        draft: `/home/events`
      },
      member: {
        dataIsRequired: _.get( req, 'agenda.settings.contribution.useFields', false )
      },
      event: {
        message: _.get( req, 'agenda.settings.contribution.messages.instructions' )
      },
      confirmation: {
        message: _.get( req, 'agenda.settings.contribution.messages.complete' )
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
