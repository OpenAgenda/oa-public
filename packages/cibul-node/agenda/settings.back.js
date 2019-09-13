"use strict";

const mw = require( '@openagenda/agenda-settings' ).mw;
const keysMw = require( '@openagenda/keys/middleware' );
const labels = require( '@openagenda/labels/agenda-settings/agendaEdition' );
const getLabel = require( '@openagenda/labels' )( labels );
const core = require( '../core' );
const cmn = require( '../lib/commons-app' );
const sessions = require( '../services/sessions' );
const members = require( '../services/members' );


module.exports = app => {
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
