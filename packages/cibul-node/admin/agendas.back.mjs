import _ from 'lodash';
import agendasSvc from '@openagenda/agendas';
import { mw } from '@openagenda/admin-agendas';
import cmn from '../lib/commons-app.js';

const PreMw = ({ sessions }) => [
  cmn.loadBaseData('oa-admin.css'),
  sessions.mw.ifUnlogged((req, res) => res.redirect(302, '/')),
  cmn.requireSuperAdmin,
];

function index(req, res) {
  cmn.render(req, res, 'admin/agendas', req.templateData);
}

export default app => {
  const {
    aggregators,
  } = app.services;

  const preMw = PreMw(app.services);

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
          uid: 'params.uid',
        },
      },
    }),
    async (req, res, next) => {
      try {
        if (_.get(req, 'body.credentials.aggregator')) {
          await aggregators.set(req.agenda.uid, {
            limit: -1,
          }, { patch: true, protected: false });
        }

        if (_.get(req, 'body.credentials.aggregator') === false) {
          await aggregators.set(req.agenda.uid, {
            limit: null,
          }, { patch: true, protected: false });
        }

        next();
      } catch (e) {
        next(e);
      }
    },
    mw.agendas.set,
  );

  app.get(
    '/admin/agendas/members/search',
    preMw,
    ({ query }, res, next) => {
      query.agendaId = query.agendaId ? parseInt(query.agendaId, 10) : null;
      query.order = 'role.desc';
      next();
    },
    mw.members.list,
  );
};
