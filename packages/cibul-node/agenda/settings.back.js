"use strict";

const mw = require( '@openagenda/agenda-settings' ).mw;
const keysMw = require( '@openagenda/keys/middleware' );
const labels = require( '@openagenda/labels/agenda-settings/agendaEdition' );
const getLabel = require( '@openagenda/labels' )( labels );
const cmn = require( '../lib/commons-app' );
const sessions = require( '../services/sessions' );
const members = require( '../services/members' );
const { produce } = require('immer');


module.exports = app => {
  const { agendas, core } = app.services;

  app.post(
    '/new',
    sessions.mw.loadOrRedirect(),
    agendas.getConfig().upload.middleware([{ name: 'image', unique: true }]),
    mw.create
  );

  app.post(
    '/agendas/slugs/available',
    sessions.mw.loadOrRedirect(),
    mw.slugs.available
  );

  app.get(
    '/agendas/:uid/admin/settings.json',
    sessions.mw.loadOrRedirect(),
    cmn.loadAgendaBy( 'uid' ),
    members.mw.loadAndAuthorize('administrator'),
    mw.get
  );

  app.post(
    '/:slug/admin/settings/edit',
    sessions.mw.loadOrRedirect(),
    cmn.loadAgenda,
    members.mw.loadAndAuthorize('administrator'),
    agendas.getConfig().upload.middleware([{
      name: 'image',
      unique: true
    }]),
    (req, res, next) => {
      core.agendas(req.agenda).update(req.body, {
        includeImagePath: true,
        private: null,
        context: { user: req.user },
        internal: true
      }).then(agenda => res.json({
        success: true,
        agenda
      }), err => {
        if (err.name === 'BadRequest') {
          return res.status(400).json(err);
        }

        next(err);
      });
    }
  );

  app.post(
    '/:slug/admin/settings/adminevents/:version',
    sessions.mw.loadOrRedirect(),
    cmn.loadAgenda,
    members.mw.loadAndAuthorize('moderator'),
    (req, res, next) => {
      core.agendas(req.agenda).update({
        settings: produce(req.agenda.settings, draft => {
          if (!draft.lab) {
            draft.lab = {};
          }
          draft.lab.eventAdmin = req.params.version === 'new';
        })
      }, {
        includeImagePath: true,
        private: null,
        context: { user: req.user },
        internal: true
      }).then(agenda => res.json({
        success: true,
        agenda
      }), next);
    }
  );

  app.post(
    '/:slug/admin/settings/remove',
    sessions.mw.loadOrRedirect(),
    cmn.loadAgenda,
    members.mw.loadAndAuthorize('administrator'),
    (req, res, next) => {
      req.app.services.core.agendas( req.agenda.uid ).remove().then( () => {
        sessions.setFlash( req, res, getLabel( 'agendaRemoved', req.lang ) );
        res.json( { redirectTo: '/home' } );
      }, next );
    }
  );

  app.post(
    '/:slug/admin/settings/keys/create',
    sessions.mw.loadOrRedirect(),
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
    sessions.mw.loadOrRedirect(),
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
    sessions.mw.loadOrRedirect(),
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
    sessions.mw.loadOrRedirect(),
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
    sessions.mw.loadOrRedirect(),
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
