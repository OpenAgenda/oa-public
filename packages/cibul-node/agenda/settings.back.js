"use strict";

const _ = require( 'lodash' );
const React = require( 'react' );
const ReactDOM = require( 'react-dom/server' );
const config = require( '../config' );
const core = require( '../core' );
const cmn = require( '../lib/commons-app' );
const agendaSettings = require( '@openagenda/agenda-settings' );
const mw = agendaSettings.mw;
const keysMw = require( '@openagenda/keys/middleware' );

const labels = require( '@openagenda/labels/agenda-settings/agendaEdition' );
const getLabel = require( '@openagenda/labels' )( labels );

const layout = require('../services/lib/layouts').load( 'agendaAdmin' );
const members = require('../services/members');
const sessions = require('../services/sessions');

module.exports = app => {
  app.get(
    '/new',
    sessions.mw.loadOrRedirect,
    cmn.loadBaseData( 'oasfmain.css' ),
    getNewApp
  );

  app.get(
    '/:slug/admin/settings',
    sessions.mw.loadOrRedirect,
    cmn.verifyIPMiddleware,
    cmn.loadAgenda,
    members.mw.loadAndAuthorize('administrator'),
    matchEditApp
  );

  app.get(
    '/:slug/admin/settings/?*?',
    sessions.mw.loadOrRedirect,
    cmn.verifyIPMiddleware,
    cmn.loadAgenda,
    members.mw.loadAndAuthorize('administrator'),
    matchEditApp
  );

  app.post(
    '/new',
    sessions.mw.loadOrRedirect,
    mw.create
  );

  app.post(
    '/agendas/slugs/available',
    sessions.mw.loadOrRedirect,
    mw.slugs.available
  );

  app.get(
    '/agendas/:uid/admin/settings.json',
    sessions.mw.loadOrRedirect,
    cmn.loadAgendaBy( 'uid' ),
    members.mw.loadAndAuthorize('administrator'),
    mw.get
  );

  app.post(
    '/:slug/admin/settings/edit',
    sessions.mw.loadOrRedirect,
    cmn.loadAgenda,
    members.mw.loadAndAuthorize('administrator'),
    ( req, res, next ) => {
      req.context = { user: req.user };
      next();
    },
    mw.set
  );

  app.post(
    '/:slug/admin/settings/setImage',
    sessions.mw.loadOrRedirect,
    cmn.loadAgenda,
    members.mw.loadAndAuthorize('administrator'),
    mw.setImage
  );

  app.post(
    '/:slug/admin/settings/clearImage',
    sessions.mw.loadOrRedirect,
    cmn.loadAgenda,
    members.mw.loadAndAuthorize('administrator'),
    mw.clearImage
  );

  app.post(
    '/:slug/admin/settings/remove',
    sessions.mw.loadOrRedirect,
    cmn.loadAgenda,
    members.mw.loadAndAuthorize('administrator'),
    ( req, res, next ) => {
      core.agendas( req.agenda.uid ).remove().then( () => {
        sessions.setFlash( req, res, getLabel( 'agendaRemoved', req.lang ) );
        res.json( { redirectTo: '/home' } );
      }, next );
    }
  );

  app.post(
    '/:slug/admin/settings/keys/create',
    sessions.mw.loadOrRedirect,
    cmn.loadAgenda,
    members.mw.loadAndAuthorize('administrator'),
    ( req, res, next ) => {
      req.identifiers = {
        type: 'agendaFullRead',
        identifier: req.agenda.uid
      };
      next();
    },
    keysMw.create(),
    ( req, res, next ) => res.send( req.result )
  );

  app.get(
    '/:slug/admin/settings/keys/get',
    sessions.mw.loadOrRedirect,
    cmn.loadAgenda,
    members.mw.loadAndAuthorize('administrator'),
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
  );

  app.get(
    '/:slug/admin/settings/keys/list',
    sessions.mw.loadOrRedirect,
    cmn.loadAgenda,
    members.mw.loadAndAuthorize('administrator'),
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
  );

  app.patch(
    '/:slug/admin/settings/keys/update',
    sessions.mw.loadOrRedirect,
    cmn.loadAgenda,
    members.mw.loadAndAuthorize('administrator'),
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
  );

  app.delete(
    '/:slug/admin/settings/keys/remove',
    sessions.mw.loadOrRedirect,
    cmn.loadAgenda,
    members.mw.loadAndAuthorize('administrator'),
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
  );
};


function getNewApp( req, res ) {

  const lang = req.lang || 'fr';
  const scriptParams = {
    state: {
      settings: {
        prefix: '/new',
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
    role: req.member.role,
    selectedTab: 'settings_' + (state.routing.locationBeforeTransitions.pathname.substr( state.settings.prefix.length + 1 ) || 'profile'),
    lang: _.get( req, 'lang', 'fr' ),
    agenda: req.agenda,
    bodyAttributes: [
      {
        name: 'data-options',
        value: JSON.stringify( { state } )
      }
    ],
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
