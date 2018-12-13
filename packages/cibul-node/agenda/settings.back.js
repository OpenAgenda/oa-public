"use strict";

const React = require( 'react' );
const ReactDOM = require( 'react-dom/server' );
const config = require( '../config' );
const modLib = require( '../lib/moduleLib.js' );
const cmn = require( '../lib/commons-app' );
const agendaSettings = require( '@openagenda/agenda-settings' );
const mw = agendaSettings.mw;
const agendaSvc = require( '../services/agenda' );
const sessions = require( '@openagenda/sessions' );
const keysMw = require( '@openagenda/keys/middleware' );

const labels = require( '@openagenda/labels/agenda-settings/agendaEdition' );
const getLabel = require( '@openagenda/labels' )( labels );


module.exports = path => {

  const routes = {

    agendaSettingsCreateApp: [ 'get', '/new', [
      cmn.loadBaseData( 'oasfmain.css' ),
      getNewApp
    ] ],

    agendaSettingsEditApp: [ 'get', '/:slug/admin/settings', cmn.verifyIPMiddleware.concat( [
      agendaSvc.mw.load( 'slug' ),
      cmn.checkAdministrator(),
      agendaSvc.mw.loadAdminLayout,
      cmn.loadBaseData( 'oasfmain.css' ),
      matchEditApp
    ] ) ],

    agendaSettingsEditSub: [ 'get', '/:slug/admin/settings/?*?', cmn.verifyIPMiddleware.concat( [
      agendaSvc.mw.load( 'slug' ),
      cmn.checkAdministrator(),
      agendaSvc.mw.loadAdminLayout,
      cmn.loadBaseData( 'oasfmain.css' ),
      matchEditApp
    ] ) ],

    /**********/

    agendaSettingsCreateAgenda: [ 'post', '/new',
      mw.create
    ],

    agendaSettingsSlugAvailable: [ 'post', '/agendas/slugs/available',
      mw.slugs.available
    ],

    agendaSettingsGetAgenda: [ 'get', '/agendas/:uid/admin/settings.json', [
      agendaSvc.mw.load( 'uid' ),
      cmn.checkAdministrator(),
      mw.get
    ] ],

    agendaSettingsEditAgenda: [ 'post', '/:slug/admin/settings/edit', [
      agendaSvc.mw.load( 'slug' ),
      cmn.checkAdministrator(),
      ( req, res, next ) => {
        req.context = { user: req.user };
        next();
      },
      mw.set
    ] ],

    agendaSettingsSetImage: [ 'post', '/:slug/admin/settings/setImage', [
      agendaSvc.mw.load( 'slug' ),
      cmn.checkAdministrator(),
      mw.setImage
    ] ],

    agendaSettingsClearImage: [ 'post', '/:slug/admin/settings/clearImage', [
      agendaSvc.mw.load( 'slug' ),
      cmn.checkAdministrator(),
      mw.clearImage
    ] ],

    agendaSettingsRemoveAgenda: [ 'post', '/:slug/admin/settings/remove', [
      agendaSvc.mw.load( 'slug' ),
      cmn.checkAdministrator(),
      mw.removeAgenda,
      ( req, res ) => {
        sessions.setFlash( req, res, getLabel( 'agendaRemoved', req.lang ) );
        res.json( { redirectTo: req.genUrl( 'homeShow' ) } );
      }
    ] ],

    /**********/

    agendaSettingsKeysCreate: [ 'post', '/:slug/admin/settings/keys/create', [
      agendaSvc.mw.load( 'slug' ),
      cmn.checkAdministrator(),
      ( req, res, next ) => {
        req.identifiers = {
          type: 'agendaFullRead',
          identifier: req.agenda.uid
        };
        next();
      },
      keysMw.create(),
      ( req, res, next ) => res.send( req.result )
    ] ],
    agendaSettingsKeysGet: [ 'get', '/:slug/admin/settings/keys/get', [
      agendaSvc.mw.load( 'slug' ),
      cmn.checkAdministrator(),
      ( req, res, next ) => {
        req.identifiers = {
          type: 'agendaFullRead',
          identifier: req.agenda.uid,
          key: req.query.key
        };
        next();
      },
      keysMw.get(),
      ( req, res, next ) => res.send( req.result )
    ] ],
    agendaSettingsKeysList: [ 'get', '/:slug/admin/settings/keys/list', [
      agendaSvc.mw.load( 'slug' ),
      cmn.checkAdministrator(),
      ( req, res, next ) => {
        req.identifiers = {
          type: 'agendaFullRead',
          identifier: req.agenda.uid
        };
        req.options = { total: true };
        next();
      },
      keysMw.list(),
      ( req, res, next ) => res.send( req.result )
    ] ],
    agendaSettingsKeysUpdate: [ 'patch', '/:slug/admin/settings/keys/update', [
      agendaSvc.mw.load( 'slug' ),
      cmn.checkAdministrator(),
      ( req, res, next ) => {
        req.identifiers = {
          type: 'agendaFullRead',
          identifier: req.agenda.uid,
          key: req.query.key
        };
        next();
      },
      keysMw.update(),
      ( req, res, next ) => res.send( req.result )
    ] ],
    agendaSettingsKeysRemove: [ 'delete', '/:slug/admin/settings/keys/remove', [
      agendaSvc.mw.load( 'slug' ),
      cmn.checkAdministrator(),
      ( req, res, next ) => {
        req.identifiers = {
          type: 'agendaFullRead',
          identifier: req.agenda.uid,
          key: req.query.key
        };
        next();
      },
      keysMw.remove(),
      ( req, res, next ) => res.send( { rowAffected: req.result } )
    ] ]
  };

  const router = modLib.Router( routes );

  router.pre( [
    cmn.loadLogger( 'agendaSettings' ),
    sessions.middleware.load( { detailed: true } ),
    sessions.middleware.ifUnlogged( cmn.redirectTo() )
  ] );

  return {
    load: router.load( path ),
    paths: modLib.getPaths( path, routes )
  };

  function getNewApp( req, res ) {

    const lang = req.lang || 'fr';
    const scriptParams = {
      state: {
        settings: {
          prefix: req.genUrl( 'agendaSettingsCreateApp' ).split( '?' )[ 0 ],
          lang
        },
        res: {
          create: '/new',
          slugAvailable: '/agendas/slugs/available',
          onCreated: '/:slug/admin/getting-started'
        }
      }
    };

    cmn.render( req, res, 'agendaSettings/new', { scriptParams, lang } );

  }

  function getEditApp( req, res, next, { store, component } = {} ) {

    const state = store ? store.getState() : {};
    const prefix = state.settings.prefix;
    const lang = req.lang || 'fr';

    const content = component ? ReactDOM.renderToString( component ) : '';
    const tab = 'settings_' + (state.routing.locationBeforeTransitions.pathname.substr( prefix.length + 1 ) || 'profile');

    cmn.render( req, res, 'agendaSettings/edit', { scriptParams: { state }, lang, content, tab } );

  }

  function matchEditApp( req, res, next ) {

    const prefix = req.genUrl( 'agendaSettingsEditApp', { slug: req.params.slug } ).split( '?' )[ 0 ];
    const lang = req.lang || 'fr';

    mw.matchApp(
      'edit',
      {
        state: {
          settings: { prefix, lang, apiRoot: `http://localhost:${config.port}` },
          res: {
            get: '/agendas/:uid/admin/settings.json',
            slugAvailable: '/agendas/slugs/available',
            set: '/:slug/admin/settings/edit',
            uploadImage: '/:slug/admin/settings/setImage',
            clearImage: '/:slug/admin/settings/clearImage',
            remove: '/:slug/admin/settings/remove',
            keys: {
              create: '/:slug/admin/settings/keys/create',
              list: '/:slug/admin/settings/keys/list',
              update: '/:slug/admin/settings/keys/update',
              remove: '/:slug/admin/settings/keys/remove'
            }
          },
          agenda: {
            uid: req.agenda.uid,
            slug: req.agenda.slug
          }
        }
      },
      prefix,
      getEditApp
    )( req, res, next );

  }

};
