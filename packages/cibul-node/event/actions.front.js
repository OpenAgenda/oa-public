'use strict';

const _ = require('lodash');
const moment = require('moment-timezone');
const VError = require('verror');

const formSchemaDecorate = require('@openagenda/form-schemas/iso/getDecorate');
const range = require('@openagenda/date-range');

const log = require('@openagenda/logs')('event/actions');

const { getLocaleValue } = require('@openagenda/intl');
const mails = require('../services/mails');
const agendaSvc = require('../services/agenda');
const cmn = require('../lib/commons-app');
const config = require('../config');
const addCalendarLinks = require('../services/events/lib/addCalendarLinks');
const gaTrack = require('../lib/gaTrack');
const ics = require('../services/events/lib/ics');

module.exports = app => {
  const {
    events: eventsSvc,
    members: membersSvc,
  } = app.services;

  app.get(
    '/:slug/events/:eventSlug/action',
    (req, res) => {
      return res.redirect(`/${req.params.slug}/events/${req.params.eventSlug}?sharemodal=1`);
    },
  );

  app.get(
    '/:slug/events/:eventUid/action/dates',
    agendaSvc.mw.load('slug'),
    cmn.ifIs('agenda.private', membersSvc.mw.loadOrFail),
    (req, res, next) => req.app.services.core.agendas(req.agenda.uid)
      .events
      .get(req.params.eventUid, { detailed: true })
      .then(result => {
        if (!result) {
          return next({ code: 404 });
        }
        req.event = result;
        next();
      }, err => {
        next(err.name === 'BadRequestError' ? { code: 404 } : err);
      }),
    actionDatesJson
  );

  app.post(
    '/:slug/events/:eventUid/email',
    agendaSvc.mw.load('slug'),
    cmn.ifIs('agenda.private', membersSvc.mw.loadOrFail),
    (req, res, next) => eventsSvc.get({ uid: req.params.eventUid }, { includeFields: ['uid'] })
      .then(event => req.app.services.core.agendas(req.agenda.uid)
        .events
        .get(event?.uid, { detailed: true })
        .then(result => {
          if (!result) {
            return next({ code: 404 });
          }

          req.event = result;
          next();
        })
        .catch(next)
      ),
    eventMailSend
  );

  app.get(
    '/:slug/events/:eventSlug/ics',
    agendaSvc.mw.load('slug'),
    cmn.ifIs('agenda.private', membersSvc.mw.loadOrFail),
    (req, res, next) => eventsSvc.get({ slug: req.params.eventSlug }, { includeFields: ['uid'] })
      .then(event => req.app.services.core.agendas(req.agenda.uid)
        .events
        .get(event?.uid, { detailed: true }))
        .then(result => {
          if (!result) {
            return next({ code: 404 });
          }

          req.event = result;

          if (!result.timings) {
            throw new Error(`Event slug:${req.params.eventSlug} does not have timings !`);
          }

          next();
      })
        .catch(next),
    (req, res, next) => {
      res.set('Content-Type', 'text/calendar; charset=utf-8');

      if (req.query.dl) {
        res.set('Content-disposition', 'attachment; filename=' + req.event.slug + '.ics');
      }

      try {
        res.write(ics(req.agenda, req.event, req.lang, req.query.timing));

        res.end();
      } catch (e) {
        next(new VError({
          cause: e,
          info: {
            url: req.originalUrl,
            agenda: req.agenda,
            event: req.event
          }
        }));
      }
    }
  );
};


function actionDatesJson(req, res, next) {
  const service = ['google', 'yahoo', 'live', 'ics'].find(v => v === req.query.service) || 'google';

  try {
    addCalendarLinks({ root: config.root },
      req.event,
      `${config.root}/${req.agenda.slug}/events/${req.event.slug}`,
      req.agenda,
      req.lang
    );
  } catch (e) {
    return next(new VError({
      cause: e,
      info: {
        url: req.originalUrl,
        agenda: req.agenda,
        event: req.event
      }
    }));
  }

  return res.send({
    event: {
      url: `/${req.agenda.slug}/events/${req.event.slug}`,
      timezone: req.event.timezone,
      params: req.eventUriParams,
      timings: req.event.timings.map(timing => ({
        date: timing.date,
        begin: timing.begin,
        end: timing.end,
        link: timing.calendarLinks[service],
      })),
    },
  });
}


async function eventMailSend(req, res, next) {
  log('eventMailSend');

  const { events: eventsSvc } = req.app.services;

  let customData = null;

  try {
    const { event, formSchema } = await req.app.services.core.agendas(req.agenda.uid).events.get(req.event.uid, {
      load: {
        custom: true
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
    const emails = (typeof req.body.mailsend === 'string' ? req.body.mailsend : '').split(/[\s;,\n\r]+/);

    req.log.debug('will send event as email to %s', emails.join(', '));

    const logo = req.agenda.image
      ? {
        src: config.aws.imageBucketPath + req.agenda.image.replace('.com/', '.com/rwtb'),
        width: '100px'
      }
      : {
        src: `${config.root}/images/openagenda.png`,
        width: '300px'
      };

    const link = `${config.root}/${req.agenda.slug}/events/${req.event.slug}`;

    log('info', 'queuing event mails for %s', emails.join('|'), emails.length);

    const dateRange = range(req.event.timings.map(t => ({
      start: new Date(t.begin),
      end: new Date(t.end)
    })), req.lang, req.event.timezone);


    const staticMap = config.staticTiles?.replace(/{w}|{h}|{lon}|{lat}|{z}/gi,
      (matched) => { return {
       '{w}': 600,
       '{h}': 140,
       '{z}': 16,
       '{lon}':req.event.location.longitude,
       '{lat}':req.event.location.latitude
     }[matched]});

     log('staticMap', staticMap);

    await mails.send({
      template: 'event',
      to: emails.map(email => ({
        address: email,
        unsubscriptions: [
          {
            rule: ['receive', 'event'],
            dataPath: 'unsubscribeLink'
          }
        ]
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
          formattedRegistration: eventsSvc.utils.formatRegistration(req.event.registration, {
            order: ['link', 'email', 'phone'],
            includeLinkPrefix: true
          }),
          image: req.event.image ? config.aws.imageBucketPath + req.event.image.filename : null,
          location: _.mapValues(
            _.pick(req.event.location, 'name', 'address', 'region', 'city', 'postalCode'),
            v => v && typeof v.toString === 'function' ? v.toString() : v
          ),
          dates: getDates(req.event, req.lang)
        },
        customData,
        map: {
          name: req.event.location.name,
          lat: req.event.location.latitude,
          lng: req.event.location.longitude,
          zoom: 16,
          //accessToken: config.mapboxAccessToken
          staticMap,
        }
      },
      lang: req.lang
    });

    gaTrack.batch(new Array(emails.length).fill(['event', 'share', 'email']))(req);

    res.send({ count: emails.length });

    log('ICI ', {
      name: req.event.location.name,
      lat: req.event.location.latitude,
      lng: req.event.location.longitude,
      zoom: 16,
      staticMap: config.staticTiles?.replace(/{w}|{h}|{lon}|{lat}|{z}/gi,
         (matched) => { return ({
          'w': 600,
          'h': 140,
          'z': 16,
          'lon':req.event.location.longitude,
          'lat':req.event.location.latitude
        }[matched])}),

    })
  } catch (err) {
    return next(err);
  }
}

function getDates(event, lang) {
  const { timezone } = event;

  const result = event.timings.reduce((accu, val) => {
    const day = moment.tz(val.begin, event.timezone).locale(lang).format('dddd D MMMM');
    const foundDay = accu.find(v => v === day);

    if (foundDay) {
      foundDay.timings.push({
        begin: moment.tz(val.begin, event.timezone).locale(lang).format('LT'),
        end: moment.tz(val.end, event.timezone).locale(lang).format('LT')
      });
    } else {
      accu.push({
        day,
        timezone,
        timings: [
          {
            begin: moment.tz(val.begin, event.timezone).locale(lang).format('LT'),
            end: moment.tz(val.end, event.timezone).locale(lang).format('LT')
          }
        ]
      });
    }

    return accu;
  }, []);

  return result;
}
