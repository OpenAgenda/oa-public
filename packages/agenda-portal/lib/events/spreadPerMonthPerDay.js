'use strict';

const _ = require('lodash');
const moment = require('moment-timezone');
const { tz } = require('moment-timezone');

const {
  getKey: getTimingBeginKey,
  getValue: getTimingBeginValue
} = require('../timings/begin');
const getMonthWeek = require('./getMonthWeek');

function _monthDiff(currentMonth, month) {
  return moment(`${month}-01`).diff(`${currentMonth}-01`, 'months');
}

function _monthWeeks({
  month,
  weeks,
  timezone,
  today,
  timingBeginKey,
  locale
}) {
  if (!weeks) return [];

  return _.keys(weeks).map(week => ({
    week,
    label: week,
    current: today.week === week,
    days: _.keys(weeks[week]).map(day => ({
      day,
      current: today.day === day && today.month === month,
      passed: today.month + today.day > month + day,
      timings: weeks[week][day],
      label: _.capitalize(
        tz(_.get(weeks[week][day], `0.${timingBeginKey}`), timezone)
          .locale(locale)
          .format('dddd D')
      )
    }))
  }));
}

function _prepare(months, keys) {
  if (!months[keys.month]) months[keys.month] = {};
  if (!months[keys.month][keys.week]) months[keys.month][keys.week] = {};
  if (!months[keys.month][keys.week][keys.day]) months[keys.month][keys.week][keys.day] = [];
}

function _getKeys(d, timezone, locale) {
  return {
    month: tz(d, timezone)
      .locale(locale)
      .format('YYYY-MM'),
    week: getMonthWeek(d, timezone),
    day: tz(d, timezone)
      .locale(locale)
      .format('DD')
  };
}

module.exports = (timings = [], timezone = 'Europe/Paris', locale = 'en') => {
  if (!timings.length) return [];

  const keyedTimings = timings.reduce(
    (carry, timing) => {
      const start = new Date(getTimingBeginValue(timing));

      if (!carry.first || start < carry.first) {
        carry.first = start;
      }

      if (!carry.last || start > carry.last) {
        carry.last = start;
      }

      const keys = _getKeys(getTimingBeginValue(timing), timezone, locale);

      if (!_.get(carry.months, [keys.month, keys.week, keys.day])) {
        _prepare(carry.months, keys);
      }

      return _.set(
        carry,
        ['months', keys.month, keys.week, keys.day],
        _.get(carry.months, [keys.month, keys.week, keys.day], []).concat(
          timing
        )
      );
    },
    {
      first: null,
      last: null,
      months: {}
    }
  );

  const months = [];
  const today = _getKeys(new Date(), timezone, locale);
  const dayCursor = keyedTimings.first;

  const last = tz(keyedTimings.last, timezone)
    .locale(locale)
    .format('YYYY-MM');

  while (
    tz(dayCursor, timezone)
      .locale(locale)
      .format('YYYY-MM') <= last
  ) {
    const keys = _getKeys(dayCursor, timezone, locale);

    months.push({
      key: keys.month,
      diff: _monthDiff(today.month, keys.month),
      current: today.month === keys.month,
      label: _.capitalize(
        tz(dayCursor, timezone)
          .locale(locale)
          .format('MMMM YYYY')
      ),
      weeks: _monthWeeks({
        month: keys.month,
        weeks: keyedTimings.months[keys.month],
        timezone,
        today,
        timingBeginKey: getTimingBeginKey(_.first(timings)),
        locale
      })
    });

    dayCursor.setMonth(dayCursor.getMonth() + 1);
  }

  const nearestMonthIndex = months.reduce(
    ({ diff, index }, month, monthIndex) => ({
      diff: Math.abs(month.diff) < diff ? month.diff : diff,
      index: Math.abs(month.diff) < diff ? monthIndex : index
    }),
    { diff: Math.abs(months[0].diff), index: 0 }
  ).index;

  months[nearestMonthIndex].displayed = true;

  return months.map((m, index) => _.assign(m, {
    hasPrevious: index !== 0,
    hasNext: index !== months.length - 1
  }));
};
