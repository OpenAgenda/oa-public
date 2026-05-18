import _ from 'lodash';
import qs from 'qs';
import errorLabels from '@openagenda/labels/errors/index.js';
import cmn from '../lib/commons-app.js';
import redirectMiddelware from './redirect.middleware.js';

function redirect(req, res, next) {
  const { core } = req.app.services;
  const { root } = core.getConfig();

  if (!req.agenda || !req.event) {
    return next({ code: 404 });
  }

  const preservedQuery = Object.fromEntries(
    Object.entries(req.query).filter(
      ([key]) =>
        key === 'lang' || key.startsWith('utm_') || key.startsWith('mtm_'),
    ),
  );

  if (req.query.sharemodal !== undefined) {
    preservedQuery.sharemodal = null;
  }

  const queryString = qs.stringify(preservedQuery, {
    addQueryPrefix: true,
    skipNulls: true,
  });

  return res.redirect(
    301,
    `${root}/${req.agenda.slug}/events/${req.event.uid}_${req.event.slug}${queryString}`,
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
      const uidMatch = req.params.eventSlug.match(/^(\d+)(?:_.*)?$/);
      const identifier = uidMatch
        ? { uid: uidMatch[1] }
        : { slug: req.params.eventSlug };

      events.get(identifier, { detailed: true }).then((event) => {
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
      if (!req.event) {
        return next({ code: 404 });
      }
      req.agenda = req.event.agenda;
      next();
    },
    redirect,
  );
};
