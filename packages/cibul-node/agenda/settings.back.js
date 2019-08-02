"use strict";

const core = require( '../core' );
const cmn = require( '../lib/commons-app' );
const mw = require( '@openagenda/agenda-settings' ).mw;
const sessions = require( '@openagenda/sessions' );
const keysMw = require( '@openagenda/keys/middleware' );

const labels = require( '@openagenda/labels/agenda-settings/agendaEdition' );
const getLabel = require( '@openagenda/labels' )( labels );

const preMw = [
  cmn.loadLogger( 'agendaSettings' ),
  sessions.middleware.ifUnlogged( ( req, res ) => res.redirect( 302, '/' ) )
];


module.exports = app => {

  app.post(
    '/new',
    preMw,
    mw.create
  );

  app.post(
    '/agendas/slugs/available',
    preMw,
    mw.slugs.available
  );

  app.get(
    '/agendas/:uid/admin/settings.json',
    preMw,
    cmn.loadAgendaBy( 'uid' ),
    cmn.authorize.administrator,
    mw.get
  );

  app.post(
    '/:slug/admin/settings/edit',
    preMw,
    cmn.loadAgenda,
    cmn.authorize.administrator,
    ( req, res, next ) => {
      req.context = { user: req.user };
      next();
    },
    mw.set
  );

  app.post(
    '/:slug/admin/settings/setImage',
    preMw,
    cmn.loadAgenda,
    cmn.authorize.administrator,
    mw.setImage
  );

  app.post(
    '/:slug/admin/settings/clearImage',
    preMw,
    cmn.loadAgenda,
    cmn.authorize.administrator,
    mw.clearImage
  );

  app.post(
    '/:slug/admin/settings/remove',
    preMw,
    cmn.loadAgenda,
    cmn.authorize.administrator,
    ( req, res, next ) => {
      core.agendas( req.agenda.uid ).remove().then( () => {
        sessions.setFlash( req, res, getLabel( 'agendaRemoved', req.lang ) );
        res.json( { redirectTo: '/home' } );
      }, next );
    }
  );

  app.post(
    '/:slug/admin/settings/keys/create',
    preMw,
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
  );

  app.get(
    '/:slug/admin/settings/keys/get',
    preMw,
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
  );

  app.get(
    '/:slug/admin/settings/keys/list',
    preMw,
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
  );

  app.patch(
    '/:slug/admin/settings/keys/update',
    preMw,
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
  );

  app.delete(
    '/:slug/admin/settings/keys/remove',
    preMw,
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
  );

};
