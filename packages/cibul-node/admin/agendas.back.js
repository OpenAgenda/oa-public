"use strict";

const _ = require('lodash');
const marked = require('marked');
const sessions = require( '@openagenda/sessions' );
const agendasSvc = require( '@openagenda/agendas' );
const aggregatorsSvc = require('../services/aggregators').instance;
const mw = require( '@openagenda/admin-agendas' ).mw;
const cmn = require( '../lib/commons-app' );
const config = require( '../config' );
const layouts = require('../services/lib/layouts');
const renderAddEvent = _.template(
  require('fs').readFileSync(__dirname + '/addEvent.tpl', 'utf-8')
);

const getLabel = require('@openagenda/labels/makeLabelGetter')(
  require('@openagenda/labels/event/addEvent')
);

const preMw = [
  cmn.loadBaseData( 'compiledAdmin.css' ),
  sessions.middleware.ifUnlogged( ( req, res ) => res.redirect( 302, '/' ) ),
  cmn.requireSuperAdmin
];


module.exports = app => {
  const {
    agendas,
    events
  } = app.services;

  app.get('/admin/agendas/', preMw, index);
  app.get('/admin/agendas/search', preMw, mw.agendas.list);
  app.get('/admin/agendas/get', preMw, mw.agendas.get);

  app.post(
    '/admin/agendas/:uid',
    preMw,
    ( req, res, next ) => {
      req.context = { user: req.user };
      next();
    },
    agendasSvc.middleware.load( {
      private: null,
      internal: true,
      namespaces: {
        identifiers: {
          uid: 'params.uid'
        }
      }
    } ),
    async ( req, res, next ) => {
      try {
        if ( _.get( req, 'body.credentials.aggregator' ) ) {
          const aggregator = await aggregatorsSvc.get( req.agenda.uid );

          if (!aggregator) {
            await aggregatorsSvc.set(req.agenda.uid, {
              rules: []
            });
          }
        }

        next();
      } catch ( e ) {
        next( e );
      }
    },
    mw.agendas.set
  );

  app.get(
    '/admin/agendas/members/search',
    preMw,
    ( req, res, next ) => {

      req.query.agendaId = req.query.agendaId ? parseInt( req.query.agendaId ) : null;

      req.query.order = 'role.desc';

      next();

    },
    mw.members.list
  );

  app.get(
    ['/:agendaSlug/addevent', '/:agendaSlug/event/:eventSlug/edit'],
    agendas.mw.load,
    (req, res, next) => {
      if (!req.agenda) return next({ code: 404 });
      next();
    },
    (req, res, next) => {
      if (!req.params.eventSlug) {
        return next();
      }
      events.get({ slug: req.params.eventSlug }).then(event => {
        req.event = event;
        next();
      });
    },
    (req, res, next) => {
      if (!req.agenda.credentials.useContributeApp) {
        return next();
      }
      res.redirect(301, req.event
        ? `/${req.agenda.slug}/contribute/event/${req.event.uid}`
        : `/${req.agenda.slug}/contribute`
      );
    },
    (req, res, next) => {
      res.send(layouts.agenda(renderAddEvent({
        title: getLabel('title', req.lang),
        message: marked(getLabel('message', req.lang)),
        support: getLabel('support', req.lang),
        supportLink: `/support?origin=${encodeURIComponent(`/${req.agenda.slug}/addevent`)}`
      }), {
        agenda: req.agenda,
        lang: req.lang,
        title: '/addevent'
      }));
    }
  );

};


function index( req, res ) {
  cmn.render( req, res, 'admin/agendas', req.templateData );
}

