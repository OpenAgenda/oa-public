"use strict";

const cmn = require( '../lib/commons-app' );
const app = require( 'express' )();
const config = require( '../config' );
const sessions = require( '@openagenda/sessions' );
const legacyAgendaSvc = require( '../services/agenda' );
const agendasSvc = require( '@openagenda/agendas' );
const agendaStatistics = require( '../services/agendaStatistics' );

const agendaLoad = require( '@openagenda/agendas' ).middleware.load( {
  private: null,
  internal: true,
  namespaces: {
    identifiers: {
      slug: 'params.agendaSlug',
      uid: 'params.agendaUid'
    }
  }
} );


module.exports = parentApp => {

  parentApp.use( '/', app );

}


// All paths of this app are accessible to agenda admins only
// As app is used on base path of parent app, routes
// must be explicited in following use.

app.use( [
  '/:agendaSlug/admin/stats',
  '/:agendaSlug/admin/stats/resync/:type',
  '/:agendaSlug/admin/getting-started'
], [
  cmn.loadLogger( 'agendaBack' ),
  sessions.middleware.ifUnlogged( cmn.redirectTo() ),
  agendaLoad
] );


app.get( '/agendas/:agendaUid/admin/*?(/*)?', agendaAdminRedirect );

app.use( [
  '/:agendaSlug/admin/getting-started'
], [
  legacyAgendaSvc.mw.loadAdminLayout,
  cmn.loadBaseData( 'oasfmain.css' )
] );



/**
 * statistics route
 */

app.get( '/:agendaSlug/admin/stats', async ( req, res, next ) => {

  res.json( await agendaStatistics( req.agenda.uid ) );

} );

app.get( '/:agendaSlug/admin/stats/transfer-form-schema', async ( req, res ) => {

  res.json( await agendaStatistics.transferFormSchema( req.agenda ) );

} );

app.get( '/:agendaSlug/admin/stats/transfer-to-tagset', async ( req, res ) => {

  res.json( await agendaStatistics.formSchemaToTagSet( req.agenda, !!req.query.force ) );

} );

app.get( '/:agendaSlug/admin/stats/transfer-to-custom', async ( req, res ) => {

  res.json( await agendaStatistics.formSchemaToCustom( req.agenda, !!req.query.force ) );

} );




/**
 * resync what can be
 */

app.get( '/:agendaSlug/admin/stats/resync/:type', ( req, res, next ) => {

  agendaStatistics.resync( req.agenda.uid, req.params.type );

  res.json( { operation: 'resyncing ' + req.params.type } );

} );


/**
 * redirection admin route
 */

function agendaAdminRedirect( req, res, next ) {

  if ( /events\.(json|csv|xlsx|rss)|settings/.test( req.url ) ) {

    return next();

  }

  agendasSvc.get( { uid: req.params.agendaUid }, { private: null }, ( err, agenda ) => {

    if ( err ) return next( err );

    if ( !agenda ) return next( new Error( 'agenda not found ( uid ): ' + req.params.agendaUid ) );

    res.redirect( req.originalUrl.replace( `/agendas/${agenda.uid}`, `/${agenda.slug}` ) );

  } );

}


/**
 * getting started route
 */

app.get( '/:agendaSlug/admin/getting-started', [
  cmn.checkAdministrator( { useLegacy: false } ),
  ( req, res ) => {

    cmn.render( req, res, 'agendaAdmin/gettingStarted', {
      agenda: req.agenda,
      scriptParams: {
        res: {
          agenda: req.genUrl( 'agendaShow', { slug: req.agenda.slug } ),
          setImage: req.genUrl( 'agendaSettingsSetImage', { slug: req.agenda.slug } ),
          clearImage: req.genUrl( 'agendaSettingsClearImage', { slug: req.agenda.slug } ),
          addEvent: req.genUrl( 'agendaEventNew', { slug: req.agenda.slug } ),
          createEmbed: req.genUrl( 'agendaEmbedIndex', { slug: req.agenda.slug } )
        },
        lang: req.lang || 'fr'
      }, lang: req.lang || 'fr'
    } );

  }
] );
