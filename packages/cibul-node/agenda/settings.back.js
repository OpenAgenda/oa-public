"use strict";

const React = require( 'react' );
const modLib = require( '../lib/moduleLib.js' );
const cmn = require( '../lib/commons-app' );
const mw = require( '@openagenda/agenda-settings' ).mw;
const agendaSvc = require( '../services/agenda' );
const sessions = require( '@openagenda/sessions' );
const keysMw = require( '@openagenda/keys/middleware' );

const labels = require( '@openagenda/labels/agenda-settings/agendaEdition' );
const getLabel = require( '@openagenda/labels' )( labels );

module.exports = path => {

  const routes = {

    agendaSettingsCreateAgenda: [
      'post', '/new',
      mw.create
    ],

    agendaSettingsSlugAvailable: [
      'post', '/agendas/slugs/available',
      mw.slugs.available
    ],

    agendaSettingsGetAgenda: [
      'get', '/agendas/:uid/admin/settings.json', [
        agendaSvc.mw.load( 'uid' ),
        cmn.checkAdministrator(),
        mw.get
      ]
    ],

    agendaSettingsEditAgenda: [
      'post', '/:slug/admin/settings/edit', [
        agendaSvc.mw.load( 'slug' ),
        cmn.checkAdministrator(),
        ( req, res, next ) => {
          req.context = { user: req.user };
          next();
        },
        mw.set
      ]
    ],

    agendaSettingsSetImage: [
      'post', '/:slug/admin/settings/setImage', [
        agendaSvc.mw.load( 'slug' ),
        cmn.checkAdministrator(),
        mw.setImage
      ]
    ],

    agendaSettingsClearImage: [
      'post', '/:slug/admin/settings/clearImage', [
        agendaSvc.mw.load( 'slug' ),
        cmn.checkAdministrator(),
        mw.clearImage
      ]
    ],

    agendaSettingsRemoveAgenda: [
      'post', '/:slug/admin/settings/remove', [
        agendaSvc.mw.load( 'slug' ),
        cmn.checkAdministrator(),
        mw.removeAgenda,
        ( req, res ) => {
          sessions.setFlash( req, res, getLabel( 'agendaRemoved', req.lang ) );
          res.json( { redirectTo: '/home' } );
        }
      ]
    ],

    /**********/

    agendaSettingsKeysCreate: [
      'post', '/:slug/admin/settings/keys/create', [
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
      ]
    ],
    agendaSettingsKeysGet: [
      'get', '/:slug/admin/settings/keys/get', [
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
      ]
    ],
    agendaSettingsKeysList: [
      'get', '/:slug/admin/settings/keys/list', [
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
      ]
    ],
    agendaSettingsKeysUpdate: [
      'patch', '/:slug/admin/settings/keys/update', [
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
      ]
    ],
    agendaSettingsKeysRemove: [
      'delete', '/:slug/admin/settings/keys/remove', [
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
      ]
    ]
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

};
