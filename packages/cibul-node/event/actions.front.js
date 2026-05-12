import _ from 'lodash';
import moment from 'moment-timezone';
import VError from '@openagenda/verror';
import extractEmails from '@openagenda/mails/extractEmails';
import formSchemaDecorate from '@openagenda/form-schemas/iso/getDecorate.js';
import range from '@openagenda/date-range';
import logs from '@openagenda/logs';
import { getLocaleValue } from '@openagenda/intl';
import cmn from '../lib/commons-app.js';

import track from '../lib/track.js';
import ics from '../services/events/lib/ics.js';

const log = logs('event/actions');

function getDates(event, lang) {
  const { timezone } = event;

  const result = event.timings.reduce((accu, val) => {
    const day = moment
      .tz(val.begin, event.timezone)
      .locale(lang)
      .format('dddd D MMMM');
    const foundDay = accu.find((v) => v === day);

    if (foundDay) {
      foundDay.timings.push({
        begin: moment.tz(val.begin, event.timezone).locale(lang).format('LT'),
        end: moment.tz(val.end, event.timezone).locale(lang).format('LT'),
      });
    } else {
      accu.push({
        day,
        timezone,
        timings: [
          {
            begin: moment
              .tz(val.begin, event.timezone)
              .locale(lang)
              .format('LT'),
            end: moment.tz(val.end, event.timezone).locale(lang).format('LT'),
          },
        ],
      });
    }

    return accu;
  }, []);

  return result;
}

async function eventMailSend(req, res, next) {
  const { events: eventsSvc, mails, core } = req.app.services;
  const config = core.getConfig();

  let customData = null;

  try {
    const { event, formSchema } = await req.app.services.core
      .agendas(req.agenda.uid)
      .events.get(req.event.uid, {
        load: {
          default: false,
          custom: true,
        },
        returnPayload: true,
        access: 'public',
      });

    customData = formSchemaDecorate(_.get(formSchema, 'fields', []))(event, {
      labelsAsKeys: true,
      labelsAsValues: true,
      ignoreNonArrayObjects: true,
      lang: req.lang,
    });
  } catch (e) {
    console.log(e);
  }

  try {
    const emails = extractEmails(req.body.mailsend).slice(0, 50);

    const logo = req.agenda.image
      ? {
        src:
            config.s3.mainBucketPath
            + req.agenda.image.replace('.com/', '.com/rwtb'),
        width: '100px',
      }
      : {
        src: `${config.root}/images/openagenda.png`,
        width: '300px',
      };

    const link = `${config.root}/${req.agenda.slug}/events/${req.event.uid}_${req.event.slug}`;

    log.info('eventMailSend', {
      link,
      targettedEmailsCount: emails.length,
      message: 'queuing emails',
    });

    const dateRange = range(
      req.event.timings.map((t) => ({
        start: new Date(t.begin),
        end: new Date(t.end),
      })),
      req.lang,
      req.event.timezone,
    );

    const staticMap = config.staticTiles?.replace(
      /{w}|{h}|{lon}|{lat}|{z}/gi,
      (matched) =>
        ({
          '{w}': 600,
          '{h}': 140,
          '{z}': 16,
          '{lon}': req.event.location.longitude,
          '{lat}': req.event.location.latitude,
        })[matched],
    );

    log('staticMap', staticMap);

    await mails.send({
      template: 'event',
      to: emails.map(({ email }) => ({
        address: email,
        unsubscriptions: [
          {
            rule: ['receive', 'event'],
            dataPath: 'unsubscribeLink',
          },
        ],
      })),
      data: {
        logo,
        link,
        agendaTitle: req.agenda.title,
        event: {
          ...req.event,
          dateRange,
          title: getLocaleValue(req.event.title, req.lang),
          description: getLocaleValue(req.event.description, req.lang),
          longDescription: getLocaleValue(req.event.longDescription, req.lang),
          conditions: getLocaleValue(req.event.conditions, req.lang),
          formattedRegistration: eventsSvc.utils.formatRegistration(
            req.event.registration,
            {
              order: ['link', 'email', 'phone'],
              includeLinkPrefix: true,
            },
          ),
          image: req.event.image
            ? config.s3.mainBucketPath + req.event.image.filename
            : null,
          location: _.mapValues(
            _.pick(
              req.event.location,
              'name',
              'address',
              'region',
              'city',
              'postalCode',
            ),
            (v) => (v && typeof v.toString === 'function' ? v.toString() : v),
          ),
          dates: getDates(req.event, req.lang),
        },
        customData,
        map: {
          name: req.event.location.name,
          lat: req.event.location.latitude,
          lng: req.event.location.longitude,
          zoom: 16,
          // accessToken: config.mapboxAccessToken
          staticMap,
        },
      },
      lang: req.lang,
    });

    res.send({ count: emails.length });

    for (let i = 0; i < emails.length; i++) {
      track(req, req.agenda, 'event', 'share', 'emails');
    }
  } catch (err) {
    return next(err);
  }
}

export default (app) => {
  const {
    events: eventsSvc,
    members: membersSvc,
    users: usersSvc,
    agendas: agendasSvc,
  } = app.services;

  app.get('/:slug/events/:eventSlug/action', (req, res) =>
    res.redirect(
      `/${req.params.slug}/events/${req.params.eventSlug}?sharemodal=1`,
    ));

  const loadAgendaBySlug = agendasSvc.middleware.load({
    internal: true,
    namespaces: {
      identifiers: {
        slug: 'params.slug',
      },
    },
  });

  app.post(
    '/:slug/events/:eventUid/email',
    loadAgendaBySlug,
    usersSvc.mw.loadBySessionOrKey(),
    (req, res, next) => {
      if (!req.user) return next({ code: 401 });
      next();
    },
    cmn.ifIs('agenda.private', membersSvc.mw.loadOrFail),
    (req, res, next) =>
      eventsSvc
        .get({ uid: req.params.eventUid }, { includeFields: ['uid'] })
        .then((event) =>
          req.app.services.core
            .agendas(req.agenda.uid)
            .events.get(event?.uid, { detailed: true })
            .then((result) => {
              if (!result) {
                return next({ code: 404 });
              }

              req.event = result;
              next();
            })
            .catch(next)),
    eventMailSend,
  );

  app.get(
    '/:slug/events/:eventSlug/ics',
    loadAgendaBySlug,
    (req, res, next) => (req.agenda ? next() : next({ code: 404 })),
    cmn.ifIs('agenda.private', membersSvc.mw.loadOrFail),
    (req, res, next) =>
      eventsSvc
        .get({ slug: req.params.eventSlug }, { includeFields: ['uid'] })
        .then((event) =>
          req.app.services.core
            .agendas(req.agenda.uid)
            .events.get(event?.uid, { detailed: true }))
        .then((result) => {
          if (!result) {
            return next({ code: 404 });
          }

          req.event = result;

          if (!result.timings) {
            throw new Error(
              `Event slug:${req.params.eventSlug} does not have timings !`,
            );
          }

          next();
        })
        .catch(next),
    (req, res, next) => {
      res.set('Content-Type', 'text/calendar; charset=utf-8');

      if (req.query.dl) {
        res.set(
          'Content-disposition',
          `attachment; filename=${req.event.slug}.ics`,
        );
      }

      try {
        res.write(ics(req.agenda, req.event, req.lang, req.query.timing));

        res.end();
      } catch (e) {
        next(
          new VError({
            cause: e,
            info: {
              url: req.originalUrl,
              agenda: req.agenda,
              event: req.event,
            },
          }),
        );
      }
    },
  );
};
