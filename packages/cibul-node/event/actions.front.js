"use strict";

const async = require('async');
const _ = require('lodash');
const moment = require('moment-timezone');
const VError = require('verror');

const formSchemaDecorate = require('@openagenda/form-schemas/iso/getDecorate');
const mails = require('@openagenda/mails');
const range = require('@openagenda/date-range');

const getActionLabel = require('@openagenda/labels')(
  require('@openagenda/labels/event/actions')
);
const log = require('@openagenda/logs')('event/actions');
const agendaEventsSvc = require('@openagenda/agenda-events');

const core = require('../core');
const agendaSvc = require('../services/agenda');
const cmn = require('../lib/commons-app');
const config = require('../config');
const addCalendarLinks = require('../services/events/lib/addCalendarLinks');
const eventsSvc = require('../services/events');
const membersSvc = require('../services/members');
const sessions = require('../services/sessions');
const gaTrack = require('../lib/gaTrack.mw');
const ics = require('../services/events/lib/ics');
const getLocaleValue = require('../services/events/lib/getLocaleValue');

module.exports = app => {
  app.get(
    '/:slug/events/:eventSlug/action',
    agendaSvc.mw.load('slug'),
    cmn.ifIs('agenda.private', membersSvc.mw.loadOrFail),
    (req, res, next) => eventsSvc.get.slugToUid(req.params.eventSlug)
      .then(uid => core.agendas(req.agenda.uid)
        .events
        .get(uid, { detailed: true })
        .then(result => {
          if (!result) {
            return next(new VError({
              info: {
                url: req.originalUrl,
                agenda: req.agenda,
                eventSlug: req.params.eventSlug,
                eventUid: uid
              }
            }, 'Event not found'));
          }

          req.event = result;
          next();
        })
        .catch(next)
      ),
    cmn.loadBaseData('oa.css'),
    actionShow
  );

  app.get(
    '/:slug/events/:eventSlug/action/dates',
    agendaSvc.mw.load('slug'),
    cmn.ifIs('agenda.private', membersSvc.mw.loadOrFail),
    (req, res, next) => eventsSvc.get.slugToUid(req.params.eventSlug)
      .then(uid => core.agendas(req.agenda.uid)
        .events
        .get(uid, { detailed: true })
        .then(result => {
          if (!result) {
            return next(new VError({
              info: {
                url: req.originalUrl,
                agenda: req.agenda,
                eventSlug: req.params.eventSlug,
                eventUid: uid
              }
            }, 'Event not found'));
          }

          req.event = result;
          next();
        })
        .catch(next)
      ),
    cmn.loadBaseData('oa.css'),
    actionDatesShow
  );

  app.post(
    '/:slug/events/:eventSlug/email',
    agendaSvc.mw.load('slug'),
    cmn.ifIs('agenda.private', membersSvc.mw.loadOrFail),
    (req, res, next) => eventsSvc.get.slugToUid(req.params.eventSlug)
      .then(uid => core.agendas(req.agenda.uid)
        .events
        .get(uid, { detailed: true })
        .then(result => {
          if (!result) {
            return next(new VError({
              info: {
                url: req.originalUrl,
                agenda: req.agenda,
                eventSlug: req.params.eventSlug,
                eventUid: uid
              }
            }, 'Event not found'));
          }

          req.event = result;
          next();
        })
        .catch(next)
      ),
    eventMailSend
  );

  app.get(
    '/:slug/events/:eventUid/ics',
    agendaSvc.mw.load('slug'),
    cmn.ifIs('agenda.private', membersSvc.mw.loadOrFail),
    (req, res, next) => core.agendas(req.agenda.uid)
      .events
      .get(req.params.eventUid, { detailed: true })
      .then(result => {
        if (!result) {
          return next(new VError({
            info: {
              url: req.originalUrl,
              agenda: req.agenda,
              eventUid: req.params.eventUid,
            }
          }, 'Event not found'));
        }

        req.event = result;

        if (!result.timings) {
          throw new Error(`Event uid:${req.params.eventUid} does not have timings !`);
        }

        next();
      })
      .catch(next),
    (req, res) => {
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


function actionShow(req, res, next) {
  const loaders = {
    calendars: _calendarAction,
    agendas: _agendasAction,
    email: _emailAction
  };
  let actions = ['calendars', 'agendas', 'email'];

  if (req.query.action && actions.indexOf(req.query.action) !== -1) {
    actions = [req.query.action];
  }

  req.templateData = {
    actions: actions,
    event: {
      uid: req.event.uid,
      title: getLocaleValue(req.event.title, req.lang),
      imports: [],
      url: `/${req.agenda.slug}/events/${req.event.slug}`,
      params: {
        slug: req.agenda ? req.agenda.slug : undefined,
        eventSlug: req.event.slug
      }
    },
    agenda: req.agenda ? req.agenda : false
  };

  sessions.isLogged(req).then(is => {
    req.templateData.logged = is;

    if (req.query.back) {
      req.templateData.back = req.query.back;
    }

    async.eachSeries(actions, (action, scb) => {
      loaders[action](req, res, scb);
    }, err => {
      if (err) {
        return next(err);
      }

      return cmn.render(req, res, 'event/action', req.templateData);
    });

  });


}


function actionDatesShow(req, res, next) {
  const service = ['google', 'yahoo', 'live', 'ics'].find(v => v === req.query.service) || 'google';

  try {
    addCalendarLinks(
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

  return cmn.render(req, res, 'event/actionDates', {
    event: {
      url: `/${req.agenda.slug}/events/${req.event.slug}`,
      timezone: req.event.timezone,
      params: req.eventUriParams,
      timings: req.event.timings.map(timing => ({
        date: timing.date,
        begin: timing.begin,
        link: timing.calendarLinks[service]
      }))
    }
  });
}


async function eventMailSend(req, res, next) {
  log('eventMailSend');

  let customData = null;

  try {
    const data = await core.agendas(req.agenda.uid).events.get(req.event.uid, {
      customOnly: true,
      includeSchema: true,
      access: 'public',
    });

    customData = formSchemaDecorate(_.get(data, 'schema.fields', []))(data.event, {
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

    req.log('will send event as email to %s', emails.join(', '));

    const logo = req.agenda.image
      ? {
        src: config.aws.imageBucketPath + req.agenda.image.replace('.com/', '.com/rwtb'),
        width: '100px'
      }
      : {
        src: `${config.root}/images/openagenda.png`,
        width: '300px'
      };

    const link = req.genUrl(
      'agendaEventShow',
      { slug: req.agenda.slug, eventSlug: req.event.slug },
      { abs: true, protocol: 'https://' }
    );

    log('info', 'queuing event mails for %s', emails.join('|'), emails.length);

    const dateRange = range(req.event.timings.map(t => ({
      start: new Date(t.begin),
      end: new Date(t.end)
    })), req.lang, req.event.timezone);

    await mails({
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
            v => v.toString()
          ),
          dates: getDates(req.event, req.lang)
        },
        customData,
        map: {
          name: req.event.location.name,
          lat: req.event.location.latitude,
          lng: req.event.location.longitude,
          zoom: 16,
          accessToken: config.mapboxAccessToken
        }
      },
      lang: req.lang
    });

    gaTrack.batch(new Array(emails.length).fill(['event', 'share', 'email']))(req);

    sessions.setFlash(req, res, getActionLabel('eventEmailSend', { count: emails.length }, req.lang));

    res.redirect(302, `${config.root}/${req.agenda.slug}/events/${req.event.slug}`);
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

function _calendarAction(req, res, next) {
  const timings = req.event.timings;
  const multipleTimings = timings.length > 1;
  const datesUri = req.agenda ? 'agendaEventActionDatesShow' : 'eventActionDatesShow';

  addCalendarLinks(
    req.event,
    `${config.root}/${req.agenda.slug}/events/${req.event.slug}`,
    req.agenda,
    req.lang
  );

  const eventUriParams = {
    slug: req.agenda.slug,
    eventSlug: req.event.slug
  };

  req.templateData.event.imports = timings.length ? [
    {
      label: 'Google Calendar',
      uri: multipleTimings
        ? req.genUrl(datesUri, [eventUriParams, { service: 'google' }])
        : timings[0].calendarLinks.google,
    }, {
      label: 'Yahoo! Calendar',
      uri: multipleTimings
        ? req.genUrl(datesUri, [eventUriParams, { service: 'yahoo' }])
        : timings[0].calendarLinks.yahoo,
    }, {
      label: 'Windows Live',
      uri: multipleTimings
        ? req.genUrl(datesUri, [eventUriParams, { service: 'live' }])
        : timings[0].calendarLinks.live
    }, {
      label: 'ICS',
      uri: multipleTimings
        ? req.genUrl(datesUri, [eventUriParams, { service: 'ics' }])
        : timings[0].calendarLinks.ics
    }
  ] : [];

  req.templateData.event.multipleTimings = multipleTimings;

  next();
}

async function _agendasAction(req, res, next) {
  try {
    const originUid = req.event.agendaUid;

    const { items: agendasSharing } = await agendaEventsSvc.list.byEventUid(req.event.uid);
    const members = req.user
      ? await readStream(membersSvc.stream(
        {
          userUid: req.user.uid,
          role: ['contributor', 'moderator', 'administrator']
        },
        {},
        { detailed: true }
      ))
      : [];

    req.templateData.agendas = members
      .filter(member => member.agendaUid !== originUid)
      .map(member => ({
        uid: member.agenda.uid,
        slug: member.agenda.slug,
        title: member.agenda.title,
        sharing: agendasSharing.findIndex(a => a.uid === member.agenda.uid) !== -1,
        redirect: Buffer.from(req.genUrl(
          'agendaEventActionShow',
          { slug: req.agenda.slug, eventSlug: req.event.slug }
        )).toString('base64')
      }));

    next();
  } catch (e) {
    next(e);
  }
}

function _emailAction(req, res, next) {
  if (req.agenda) {
    req.templateData.mailSendUri = req.genUrl('agendaEventMailSend', {
      eventSlug: req.event.slug,
      slug: req.agenda.slug
    });
  } else {
    req.templateData.mailSendUri = req.genUrl('eventMailSend', {
      eventSlug: req.event.slug
    });
  }

  next();
}

function readStream(stream, encoding = 'utf8') {
  return new Promise((resolve, reject) => {
    // if (!stream.readableObjectMode) {
    //   stream.setEncoding(encoding);
    // }

    let data = stream.readableObjectMode ? [] : '';

    stream.on('data', chunk => {
      if (stream.readableObjectMode) {
        data.push(chunk);
      } else {
        data += chunk;
      }
    });
    stream.on('end', () => resolve(data));
    stream.on('error', error => reject(error));
  });
}
