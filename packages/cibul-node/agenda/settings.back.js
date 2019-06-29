"use strict";

const _ = require( 'lodash' );
const React = require( 'react' );
const ReactDOM = require( 'react-dom/server' );
const config = require( '../config' );
const core = require( '../core' );
const modLib = require( '../lib/moduleLib.js' );
const cmn = require( '../lib/commons-app' );
const agendaSettings = require( '@openagenda/agenda-settings' );
const mw = agendaSettings.mw;
const sessions = require( '@openagenda/sessions' );
const keysMw = require( '@openagenda/keys/middleware' );

const labels = require( '@openagenda/labels/agenda-settings/agendaEdition' );
const getLabel = require( '@openagenda/labels' )( labels );

const layout = require( '../services/lib/layouts' ).load( 'agendaAdmin' );

module.exports = path => {

  const routes = {

    agendaSettingsCreateApp: [ 'get', '/new', [
      cmn.loadBaseData( 'oasfmain.css' ),
      getNewApp
    ] ],

    agendaSettingsEditApp: [ 'get', '/:slug/admin/settings', cmn.verifyIPMiddleware.concat( [
      cmn.loadAgenda,
      cmn.authorize.administrator,
      matchEditApp
    ] ) ],

    agendaSettingsEditSub: [ 'get', '/:slug/admin/settings/?*?', cmn.verifyIPMiddleware.concat( [
      cmn.loadAgenda,
      cmn.authorize.administrator,
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
      cmn.loadAgendaBy( 'uid' ),
      cmn.authorize.administrator,
      mw.get
    ] ],

    agendaSettingsEditAgenda: [ 'post', '/:slug/admin/settings/edit', [
      cmn.loadAgenda,
      cmn.authorize.administrator,
      ( req, res, next ) => {
        req.context = { user: req.user };
        next();
      },
      mw.set
    ] ],

    agendaSettingsSetImage: [ 'post', '/:slug/admin/settings/setImage', [
      cmn.loadAgenda,
      cmn.authorize.administrator,
      mw.setImage
    ] ],

    agendaSettingsClearImage: [ 'post', '/:slug/admin/settings/clearImage', [
      cmn.loadAgenda,
      cmn.authorize.administrator,
      mw.clearImage
    ] ],

    agendaSettingsRemoveAgenda: [ 'post', '/:slug/admin/settings/remove', [
      cmn.loadAgenda,
      cmn.authorize.administrator,
      ( req, res, next ) => {
        core.agendas( req.agenda.uid ).remove().then( () => {
          sessions.setFlash( req, res, getLabel( 'agendaRemoved', req.lang ) );
          res.json( { redirectTo: '/home' } );
        }, next );
      }
    ] ],

    /**********/

    agendaSettingsKeysCreate: [ 'post', '/:slug/admin/settings/keys/create', [
      cmn.loadAgenda,
      cmn.authorize.administrator,
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
      cmn.loadAgenda,
      cmn.authorize.administrator,
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
      cmn.loadAgenda,
      cmn.authorize.administrator,
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
      cmn.loadAgenda,
      cmn.authorize.administrator,
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
      cmn.loadAgenda,
      cmn.authorize.administrator,
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
    sessions.middleware.ifUnlogged( ( req, res ) => res.redirect( 302, '/' ) )
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

    res.send( layout( `<div class="js_canvas">${component ? ReactDOM.renderToString( component ) : ''}</div>`, {
      role: req.role,
      selectedTab: 'settings_' + ( state.routing.locationBeforeTransitions.pathname.substr( state.settings.prefix.length + 1 ) || 'profile' ),
      lang: _.get( req, 'lang', 'fr' ),
      agenda: req.agenda,
      bodyAttributes: [ {
        name: 'data-options',
        value: JSON.stringify( { state } )
      } ],
      scripts: {
        bottom: [ { src: '/js/agendaSettingsEdit.js' } ]
      }
    } ) );

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
