import _ from 'lodash';
import errorLabels from '@openagenda/labels/errors/index.js';
import cmn from '../lib/commons-app.js';
import redirectMiddelware from './redirect.middleware.js';

function redirect(req, res, next) {
  const { core } = req.app.services;
  const { root } = core.getConfig();

  if (!req.agenda || !req.event) {
    return next({ code: 404 });
  }
  if (req.query.sharemodal) {
    return res.redirect(
      301,
      `${root}/${req.agenda.slug}/events/${req.event.slug}?sharemodal${req.query.lang ? `&lang=${req.query.lang}` : ''}`,
    );
  }
  res.redirect(
    301,
    `${root}/${req.agenda.slug}/events/${req.event.slug}${req.query.lang ? `?lang=${req.query.lang}` : ''}`,
  );
}

const preMw = [cmn.loadLogger('event front'), cmn.redirectLegacySearch];

export default (app) => {
  app.get(
    '/agendas/:agendaUid/events/:eventUid/share',
    preMw,
    redirectMiddelware.loadEvent,
    redirectMiddelware.loadFacebookMetas,
    redirectMiddelware.render,
  );

  app.get(
    '/agendas/:agendaUid/events/:eventUid',
    preMw,
    redirectMiddelware.loadEvent,
    redirect,
  );

  app.get(
    '/events/:eventSlug',
    preMw,
    (req, res, next) => {
      const integer = parseInt(req.params.eventSlug, 10);

      if (
        Number.isInteger(integer)
        && `${integer}`.length === req.params.eventSlug.length
      ) {
        return next('route');
      }

      next();
    },
    (req, res, next) => {
      const { events } = req.app.services;

      events
        .get({ slug: req.params.eventSlug }, { detailed: true })
        .then((event) => {
          req.event = event;
          next();
        });
    },
    (req, res, next) => {
      if (req.event?.agenda) {
        req.agenda = req.event.agenda;
        return redirect(req, res, next);
      }

      next({
        code: 403,
        message: _.get(errorLabels, ['noOrigin', req.lang], 'noOrigin.en'),
      });
    },
  );

  app.get(
    '/events/:eventUid',
    preMw,
    (req, res, next) => {
      const { events } = req.app.services;

      events
        .get({ uid: req.params.eventUid }, { detailed: true })
        .then((event) => {
          req.event = event;
          next();
        });
    },
    (req, res, next) => {
      req.agenda = req.event.agenda;
      next();
    },
    redirect,
  );
};
