"use strict";

const cmn = require( '../lib/commons-app' );
const app = require( 'express' )();
const config = require( '../config' );
const sessions = require( 'sessions' );
const legacyAgendaSvc = require( '../services/agenda' );
const agendaStatistics = require( '../services/agendaStatistics' );

const agendaLoad = require( 'agendas' ).middleware.load( {
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
  '/:agendaSlug/admin/stats/resync',
  '/:agendaSlug/admin/getting-started',
  '/agendas/:uid/admin/*?(/*)?'
], [
  cmn.loadLogger( 'agendaBack' ),
  sessions.middleware.ifUnlogged( cmn.redirectTo() ),
  agendaLoad
] );

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


/**
 * resync what can be
 */

app.get( '/:agendaSlug/admin/stats/resync', ( req, res, next ) => {

  agendaStatistics.resync( req.agenda.uid );

  res.json( { operation: 'resyncing' } );

} );


/**
 * redirection admin route
 */

app.get( '/agendas/:agendaUid/admin/*?(/*)?', 
  ( req, res ) => res.redirect( req.originalUrl.replace( `/agendas/${req.agenda.uid}`, `/${req.agenda.slug}` ) )
);


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