'use strict';

const _ = require('lodash');
const moment = require('moment-timezone');
const countries = require('./countries');

function _accessibility(acc, lang) {
  return acc.map(a => ({
    label: {
      hi: {
        en: 'Hearing impairment',
        fr: 'Handicap auditif',
      },
      sl: {
        en: 'Sign language',
        fr: 'Langage des signes',
      },
      mi: {
        en: 'Motor impairment',
        fr: 'Handicap moteur',
      },
      pi: {
        en: 'Psychic impairment',
        fr: 'Handicap psychique',
      },
      vi: {
        en: 'Visual impairment',
        fr: 'Handicap visuel',
      },
      ii: {
        en: 'Intellectual impairment',
        fr: 'Handicap intellectuel',
      },
    }[a][lang],
    code: a,
  }));
}

function _customData(event) {
  return event.tagGroups.reduce(
    (reduced, g) => _.set(reduced, g.slug, g.tags.map(t => t.label).join(', ')),
    {}
  );
}

function _countryLabel(code, lang) {
  const label = _.get(countries, _.toUpper(code), {
    fr: 'Code pays non défini',
    en: 'Undefined country code',
  });

  const defaultLang = _.first(_.keys(label));

  return _.get(label, lang, label[defaultLang]);
}

function _singleLanguage(fields, language, event) {
  fields.forEach(field => {
    const defaultLang = _.first(_.keys(_.get(event, field)));

    const value = _.get(
      event,
      `${field}.${language}`,
      _.get(event, `${field}.${defaultLang}`, null)
    );

    _.set(event, field, value);
  });

  return event;
}

function _formattedDates(timings, timezone, { from, to, lang = 'fr' } = {}) {
  const fromDate = from ? moment(from) : from;
  const toDate = to ? moment(to) : to;

  return timings
    .map(timing => {
      const begin = moment.tz(timing.start, timezone).locale(lang);
      const end = moment.tz(timing.end, timezone).locale(lang);

      timing.date = begin.format('YYYY/MM/DD');
      timing.day = begin.format('Do MMMM');
      timing.weekday = begin.format('dddd');
      timing.year = begin.format('YYYY');
      timing.beginHours = begin.format('HH');
      timing.beginMinutes = begin.format('mm');
      timing.endHours = end.format('HH');
      timing.endMinutes = end.format('mm');

      return timing;
    })
    .filter(timing => {
      const start = moment.tz(timing.start, timezone);
      const end = moment.tz(timing.end, timezone);

      if (fromDate && end.isBefore(fromDate)) {
        return false;
      }

      if (toDate && start.isAfter(toDate)) {
        return false;
      }

      return true;
    })
    .reduce((dates, timing) => {
      let dateIndex = dates.findIndex(d => d.date === timing.date);

      if (dateIndex === -1) {
        dates.push(_.pick(timing, ['date', 'day', 'weekday', 'year']));
        dateIndex = dates.length - 1;
        dates[dateIndex].timings = [];
      }

      dates[dateIndex].timings.push(
        _.omit(timing, ['date', 'day', 'weekday', 'year'])
      );

      return dates;
    }, []);
}

function _passedFlag(timings, timezone) {
  const now = moment.tz(timezone);

  return timings.every(timing => moment.tz(timing.end, timezone).diff(now) < 0);
}

function _closestDiffWithNow(timings, passed, timezone) {
  const now = moment.tz(timezone);

  if (passed) {
    return Math.abs(
      timings
        .map(timing => moment.tz(timing.end, timezone).diff(now))
        .sort((a, b) => a - b)
        .pop()
    );
  }

  const diffs = timings
    .map(timing => moment.tz(timing.start, timezone).diff(now))
    .sort((a, b) => a - b);

  const firstNext = diffs.find(v => v >= 0);

  return firstNext || diffs.shift();
}

module.exports = (event, options) => {
  const { from, to, lang } = _.merge({ lang: 'fr' }, options);

  const flattened = _singleLanguage(
    [
      'title',
      'description',
      'longDescription',
      'html',
      'range',
      'conditions',
      'location.description',
      'location.access',
    ],
    lang,
    event
  );

  const timezone = _.get(event, 'timezone', 'Europe/Paris');
  const passed = _passedFlag(flattened.timings, timezone);

  _.extend(flattened, {
    passed,
    dates: _formattedDates(flattened.timings, timezone, { from, to, lang }),
    diffWithNow: _closestDiffWithNow(flattened.timings, passed, timezone),
    custom: _customData(event),
    accessibility: _accessibility(event.accessibility, lang),
    location: _.set(
      flattened.location,
      'country',
      _countryLabel(_.get(event, 'location.countryCode', null), lang)
    ),
    hasAccessibility: !!event.accessibility.length,
  });

  const thematiqueSlug = Object.keys(event.custom).find(v => v.startsWith('thematique-'));

  if (thematiqueSlug) {
    const tagGroup = event.tagGroups.find(v => v.slug === thematiqueSlug);

    flattened.thematiqueGroup = tagGroup.name;
    flattened.thematiqueValue = tagGroup.tags[0].label;
  }

  return flattened;
};
