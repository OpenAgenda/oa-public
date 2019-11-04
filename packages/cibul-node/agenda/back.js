"use strict";

const _ = require( 'lodash' );

const app = require( 'express' )();
const fs = require( 'fs' );
const agendasSvc = require( '@openagenda/agendas' );
const agendaStatistics = require( '../services/agendaStatistics' );
const cmn = require( '../lib/commons-app' );

const members = require( '../services/members' );
const sessions = require( '../services/sessions' );

const layout = require( '../services/lib/layouts' ).load( 'agendaAdmin' );

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

const statsTemplate = _.template( fs.readFileSync( __dirname + '/stats.tpl', 'utf-8' ) );

module.exports = parentApp => parentApp.use( '/', app );

app.use('/:agendaSlug/admin/getting-started', [
  sessions.mw.loadOrRedirect,
  agendaLoad,
  members.mw.loadAndAuthorize('administrator'),
  _gettingStarted
]);


/**
 * stats routes are hit by a ping script and need to be accessible
 */
app.use( [
  '/:agendaSlug/admin/stats',
  '/:agendaSlug/admin/stats/resync/:type'
], [
  sessions.mw.load,
  agendaLoad,
  cmn.checkAdminOrModeratorOrKey
] );


app.get( '/agendas/:agendaUid/admin/*?(/*)?', agendaAdminRedirect );




/**
 * statistics route
 */

app.get( '/:agendaSlug/admin/stats',
  async (req, res, next) => res.send( layout(
    statsTemplate(await agendaStatistics(req.app.services, req.agenda.uid)),
    {...req, role: req.member.role}
  ) )
)

app.get( '/:agendaSlug/admin/stats/transfer-form-schema', async ( req, res ) => {

  res.json( await agendaStatistics.transferFormSchema( req.agenda ) );

} );

app.get( '/:agendaSlug/admin/stats/transfer-to-tagset', async ( req, res ) => {

  res.json( await agendaStatistics.formSchemaToTagSet( req.agenda, !!req.query.force ) );

} );

app.get( '/:agendaSlug/admin/stats/transfer-to-categoryset', async ( req, res ) => {

  res.json( await agendaStatistics.formSchemaToCategorySet( req.agenda, !!req.query.force ) );

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

function _gettingStarted(req, res, next) {
  return res.send( layout( `<div class="js_canvas getting-started"></div>`, {
    lang: req.lang,
    agenda: req.agenda,
    role: req.member.role,
    bodyAttributes: [ {
      name: 'data-options',
      value: JSON.stringify( {
        res: {
          agenda: req.genUrl( 'agendaShow', { slug: req.agenda.slug } ),
          setImage: req.genUrl( 'agendaSettingsSetImage', { slug: req.agenda.slug } ),
          clearImage: req.genUrl( 'agendaSettingsClearImage', { slug: req.agenda.slug } ),
          addEvent: req.genUrl( 'agendaEventNew', { slug: req.agenda.slug } ),
          createEmbed: `/${req.agenda.slug}/admin/webembed`
        },
        lang: _.get( req, 'lang', 'fr' )
      } )
    } ],
    scripts: {
      bottom: [ { src: '/js/agendaAdminGettingStarted.js' } ]
    }
  } ) );

}
