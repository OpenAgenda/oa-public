'use strict';

const _ = require('lodash');
const sessions = require('@openagenda/sessions');
const agendasSvc = require('@openagenda/agendas');
const { mw } = require('@openagenda/admin-agendas');
const cmn = require('../lib/commons-app');

const preMw = [
  cmn.loadBaseData('oa-admin.css'),
  sessions.mw.ifUnlogged((req, res) => res.redirect(302, '/')),
  cmn.requireSuperAdmin
];

function index(req, res) {
  cmn.render(req, res, 'admin/agendas', req.templateData);
}

module.exports = app => {
  const {
    aggregators
  } = app.services;

  app.get('/admin/agendas/', preMw, index);
  app.get('/admin/agendas/search', preMw, mw.agendas.list);
  app.get('/admin/agendas/get', preMw, mw.agendas.get);

  app.post(
    '/admin/agendas/:uid',
    preMw,
    (req, res, next) => {
      req.context = { user: req.user };
      next();
    },
    agendasSvc.middleware.load({
      private: null,
      internal: true,
      namespaces: {
        identifiers: {
          uid: 'params.uid'
        }
      }
    }),
    async (req, res, next) => {
      try {
        if (_.get(req, 'body.credentials.aggregator')) {
          await aggregators.set(req.agenda.uid, {
            limit: -1
          }, { patch: true, protected: false });
        }

        if (_.get(req, 'body.credentials.aggregator') === false) {
          await aggregators.set(req.agenda.uid, {
            limit: null
          }, { patch: true, protected: false });
        }

        next();
      } catch (e) {
        next(e);
      }
    },
    mw.agendas.set
  );

  app.get(
    '/admin/agendas/members/search',
    preMw,
    (req, res, next) => {
      req.query.agendaId = req.query.agendaId ? parseInt(req.query.agendaId, 10) : null;
      req.query.order = 'role.desc';
      next();
    },
    mw.members.list
  );
};
