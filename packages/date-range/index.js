'use strict';

const labels = require('@openagenda/labels/agendas/range');
const moment = require('moment-timezone');
const patterns = require('./patterns');

const ucfirst = (str) => str.substr(0, 1).toUpperCase() + str.substr(1);

function _render(template, data) {
  let out = template;

  Object.keys(data || {}).forEach((key) => {
    const regex = new RegExp(`%${key}%`);
    out = out.replace(regex, data[key], 'g');
  });

  return out;
}

function _renderDate({ date, relativeTo, isLast, lang, timezone, oneDate }) {
  const render = { day: oneDate, month: true, year: false };

  const now = new Date();

  const momentDate = moment.tz(date, timezone);

  const momentRelativeDate = relativeTo
    ? moment.tz(relativeTo, timezone)
    : relativeTo;

  if (!relativeTo) {
    render.year = now.getUTCFullYear() !== date.getUTCFullYear();
  } else {
    render.year = date.getUTCFullYear() !== relativeTo.getUTCFullYear()
      || (isLast && now.getUTCFullYear() !== date.getUTCFullYear());

    render.month = render.year
      || momentDate.month() !== momentRelativeDate.month()
      || isLast;
  }

  let template = 'D';

  if (render.day) template = `dddd ${template}`;
  if (render.month) template += ' MMMM';
  if (render.year) template += ' YYYY';

  return ucfirst(momentDate.locale(lang).format(template));
}

function _pad(str) {
  return `0${str}`.slice(-2);
}

function _getTimes(timings, lang, timezone) {
  return timings
    .map((timing) => {
      let hours = timing.start.getUTCHours();

      let minutes = timing.start.getUTCMinutes();

      if (timezone) {
        const t = moment(timing.start);

        hours = t.tz(timezone).hours();

        minutes = t.tz(timezone).minutes();
      }

      return [hours, minutes].map(_pad).join(labels.minuteSeparator[lang]);
    })
    .join(', ');
}

module.exports = (timings, lang, timezone) => {
  if (!['fr', 'en', 'ar', 'de', 'it', 'es', 'nl'].includes(lang)) {
    // eslint-disable-next-line no-param-reassign
    lang = 'en';
  }

  const dateMap = {};

  const uniqueDates = [];

  if (!timings || !timings.length || !(timings instanceof Array)) {
    return _render(labels.noDates[lang]);
  }

  timings.forEach((t) => {
    const d = moment.tz(t.start, timezone).locale(lang).format('YYYY-MM-DD');

    dateMap[d] = t.start;

    if (!uniqueDates.includes(d)) {
      uniqueDates.push(d);
    }
  });

  const firstDate = dateMap[uniqueDates[0]];
  const lastDate = dateMap[uniqueDates[uniqueDates.length - 1]];

  if (uniqueDates.length === 1) {
    return _render(labels.oneDate[lang], {
      day: _renderDate({
        date: firstDate,
        relativeTo: false,
        isLast: true,
        lang,
        timezone,
        oneDate: true,
      }),
      times: _getTimes(timings, lang, timezone),
    });
  }
  if (uniqueDates.length === 2) {
    return _render(labels.twoDates[lang], {
      firstDate: _renderDate({
        date: firstDate,
        relativeTo: lastDate,
        isLast: false,
        lang,
        timezone,
        oneDate: false,
      }),
      lastDate: _renderDate({
        date: lastDate,
        relativeTo: firstDate,
        isLast: true,
        lang,
        timezone,
        oneDate: false,
      }),
    });
  }

  const patternSuffix = patterns(timings, lang, timezone);

  return (
    _render(labels.moreDates[lang], {
      firstDate: _renderDate({
        date: firstDate,
        relativeTo: lastDate,
        isLast: false,
        lang,
        timezone,
        oneDate: false,
      }),
      lastDate: _renderDate({
        date: lastDate,
        relativeTo: firstDate,
        isLast: true,
        lang,
        timezone,
        oneDate: false,
      }),
    }) + patternSuffix
  );
};
