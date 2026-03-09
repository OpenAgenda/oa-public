import _ from 'lodash';
import cmn from '../lib/commons-app.js';
import config from '../config/index.js';
import controlDataMw from '../lib/controlDataMw.js';

function removeCsp(req, res, next) {
  res.removeHeader('Content-Security-Policy');
  res.removeHeader('Content-Security-Policy-Report-Only');
  next();
}

const preMw = [cmn.loadLogger('agenda front')];

function _showJSONIfRequested(req, res, next) {
  if (req.accepts(['html', 'json']) !== 'json') {
    return next();
  }

  if (!req.agenda) {
    return res.status(400).json({
      error: 'agenda not found',
    });
  }

  return res.json({
    ..._.pick(req.agenda, [
      'uid',
      'title',
      'description',
      'slug',
      'url',
      'official',
    ]),
    image: req.agenda.image
      ? config.s3.mainBucketPath + req.agenda.image
      : null,
  });
}

function redirect(req, res, next) {
  if (!req.agenda) {
    return next({ code: 404 });
  }

  const redirectUrl = req.genUrl(
    'agendaShow',
    { slug: req.agenda.slug, oaq: req.query.oaq },
    { protocol: 'https://' },
  );

  req.log.info('redirecting to %s', redirectUrl);

  return res.redirect(302, redirectUrl);
}

export default (app) => {
  const { agendas: agendasSvc } = app.services;

  app.options('*/controldata*', (req, res) => res.sendStatus(200));

  app.get(
    ['/agendas/:uid/controldata', '/agendas/:uid/embeds/:embedUid/controldata'],
    preMw,
    agendasSvc.middleware.load({
      internal: true,
      namespaces: {
        identifiers: {
          uid: 'params.uid',
        },
      },
    }),
    cmn.ifIs('agenda.private', (req, res, next) => {
      next({ code: 403 });
    }),
    removeCsp,
    controlDataMw,
  );

  app.get('/agendas/:uid/embeds/:embedUid/events', preMw, (req, res) => {
    res.redirect(302, `/embed/agendas/${req.params.uid}`);
  });

  app.get(
    '/agendas/:uid',
    preMw,
    cmn.redirectLegacySearch,
    agendasSvc.middleware.load({
      private: null,
      namespaces: { identifiers: { uid: 'params.uid' } },
    }),
    _showJSONIfRequested,
    redirect,
  );

  app.get(
    '/agendas/:uid/contribute',
    agendasSvc.middleware.load({
      private: null,
      namespaces: { identifiers: { uid: 'params.uid' } },
    }),
    (req, res, next) => {
      if (!req.agenda) {
        return next();
      }
      res.redirect(301, `/${req.agenda.slug}/contribute`);
    },
  );

  app.get('/:slug/actions', (req, res) => {
    res.redirect(`/${req.params.slug}?sharemodal=1`);
  });
};
