import _ from 'lodash';
import adminAgendas from '@openagenda/admin-agendas';
import validators from '@openagenda/validators';
import isURL from 'validator/lib/isURL.js';
import cmn from '../lib/commons-app.js';

const { mw } = adminAgendas;

const validatePage = validators.integer({
  min: 1,
  default: 1,
});
const limit = 20;

const PreMw = ({ sessions, users }) => [
  cmn.loadBaseData('oa-admin.css'),
  sessions.mw.ifUnlogged((req, res) => res.redirect(302, '/')),
  users.mw.allowSuperAdmin(),
];

function sendAgendaData(req, res) {
  const { core, agendas } = req.app.services;

  core
    .agendas(req.params.uid)
    .get({ access: 'internal', detailed: true })
    .then((agenda) => {
      if (!agenda) {
        res.json(null);
        return;
      }
      res.json({
        ...agenda,
        credentials: {
          ...Object.entries(agendas.utils.credentials).reduce(
            (accu, [key, value]) => ({ ...accu, [key]: value.default }),
            {},
          ),
          ...agenda.credentials,
        },
        config: {
          credentials: agendas.utils.credentials,
        },
      });
    });
}

function index(req, res) {
  cmn.render(req, res, 'admin/agendas', req.templateData);
}

export default (app) => {
  const { aggregators, agendas: agendasSvc } = app.services;

  const preMw = PreMw(app.services);

  app.get('/admin/agendas/', preMw, index);
  app.get('/admin/agendas/search', preMw, (req, res, next) => {
    const query = {};

    if (_.isInteger(parseInt(req.query.oas?.search, 10))) {
      query.uid = parseInt(req.query.oas?.search, 10);
    } else if (isURL(req.query.oas?.search)) {
      const uidOrSlug = req.query.oas?.search
        .split('/')
        .pop()
        .split('?')
        .shift();
      const isUID = _.isInteger(parseInt(uidOrSlug, 10));

      query[isUID ? 'uid' : 'slug'] = isUID
        ? parseInt(uidOrSlug, 10)
        : uidOrSlug;
    } else if (req.query.oas?.search?.length) {
      query.search = req.query.oas.search;
    }

    agendasSvc.list(
      query,
      (validatePage(req.query.searchPage) - 1) * limit,
      limit,
      { total: true, private: null },
      (err, agendas, total) => {
        if (err) {
          return next(err);
        }
        res.json({ agendas, total });
      },
    );
  });

  app.get('/admin/agendas/:uid', preMw, sendAgendaData);

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
          await aggregators.set(
            req.agenda.uid,
            {
              limit: -1,
            },
            { patch: true, protected: false },
          );
        }

        if (_.get(req, 'body.credentials.aggregator') === false) {
          await aggregators.set(
            req.agenda.uid,
            {
              limit: null,
            },
            { patch: true, protected: false },
          );
        }

        next();
      } catch (e) {
        next(e);
      }
    },
    mw.agendas.set,
    sendAgendaData,
  );

  app.get(
    '/admin/agendas/members/search',
    preMw,
    (req, res, next) => {
      req.query.agendaId = req.query.agendaId
        ? parseInt(req.query.agendaId, 10)
        : null;
      req.query.order = 'role.desc';
      next();
    },
    mw.members.list,
  );
};
