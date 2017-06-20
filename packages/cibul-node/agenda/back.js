"use strict";

const config = require( '../config' );
const modLib = require( "../lib/moduleLib.js" );
const cmn = require( '../lib/commons-app' );
const agendaSvc = require( '../services/agenda' );
const sessions = require( 'sessions' );


module.exports = path => {

  const routes = {
    gettingStarted: [ 'get', '/:slug/admin/getting-started',
      [
        cmn.checkAdministrator(),
        ( req, res ) => cmn.render( req, res, 'agendaAdmin/gettingStarted', {
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
        } )
      ]
    ],

    agendaAdminUidToSlug: [ 'get', '/agendas/:uid/admin/*?(/*)?', ( req, res ) => {
      res.redirect( req.originalUrl.replace( `/agendas/${req.agenda.uid}`, `/${req.agenda.slug}` ) );
    } ]
  };

  const router = modLib.Router( routes );

  router.pre( [
    cmn.loadLogger( 'agendaBack' ),
    sessions.middleware.ifUnlogged( cmn.redirectTo() ),
    ( req, res, next ) => {
      if ( req.params.uid ) return agendaSvc.mw.load( 'uid', 'uid' )( req, res, next );
      return agendaSvc.mw.load( 'slug' )( req, res, next );
    },
    agendaSvc.mw.loadAdminLayout,
    cmn.loadBaseData( 'oasfmain.css' )
  ] );

  return {
    load: router.load( path ),
    paths: modLib.getPaths( path, routes )
  };

};
