"use strict";

const sessions = require( '@openagenda/sessions' );
const mw = require( '@openagenda/admin-agendas' ).mw;
const cmn = require( '../lib/commons-app' );

const preMw = [
  cmn.loadBaseData( 'compiledAdmin.css' ),
  sessions.middleware.ifUnlogged( ( req, res ) => res.redirect( 302, '/' ) ),
  cmn.requireAdmin
];


module.exports = app => {

  app.get( '/admin/agendas/', preMw, index );
  app.get( '/admin/agendas/search', preMw, mw.agendas.list );
  app.get( '/admin/agendas/get', preMw, mw.agendas.get );

  app.post(
    '/admin/agendas/:uid',
    preMw,
    ( req, res, next ) => {
      req.context = { user: req.user };
      next();
    },
    mw.agendas.set
  );

  app.get(
    '/admin/agendas/stakeholders/search',
    preMw,
    ( req, res, next ) => {

      req.query.agendaId = req.query.agendaId ? parseInt( req.query.agendaId ) : null;

      req.query.order = 'credential';

      next();

    },
    mw.stakeholders.list
  );

};


function index( req, res ) {

  cmn.render( req, res, 'admin/agendas', req.templateData );

}
