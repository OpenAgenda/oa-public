import _ from 'lodash';
import moment from 'moment-timezone';
import { getValue as getTimingBeginValue } from '../timings/begin.js';
import getMonthWeek from './getMonthWeek.js';

const { tz } = moment;

function getMonthDiff(currentMonth, month) {
  return moment(`${month}-01`).diff(`${currentMonth}-01`, 'months');
}

function getTimingsKeys(d, timezone, locale) {
  return {
    month: tz(d, timezone).locale(locale).format('YYYY-MM'),
    week: getMonthWeek(d, timezone),
    day: tz(d, timezone).locale(locale).format('DD'),
  };
}

function getIsNewKey(items, key) {
  return !items.length || items[items.length - 1].key !== key;
}

function getMonthLabel(monthKey, locale) {
  return _.capitalize(
    moment(new Date(`${monthKey}-15`))
      .locale(locale)
      .format('MMMM YYYY'),
  );
}

function getNearestMonthToToday(presentMonthKey, currentNearest, months) {
  const { value: currentNearestMonthValue } = currentNearest;

  const latestMonthIndex = months.length - 1;

  if (
    currentNearestMonthValue === null
    || currentNearestMonthValue < presentMonthKey
  ) {
    return {
      index: latestMonthIndex,
      value: months[latestMonthIndex].key,
    };
  }

  return currentNearest;
}

export default (timings = [], timezone = 'Europe/Paris', locale = 'en') => {
  if (!timings.length) return [];

  const present = getTimingsKeys(new Date(), timezone, locale);
  const presentMonthKey = present.month;

  const result = timings.reduce(
    ({ months, nearestMonthToToday }, timing) => {
      if (timing.begin === null) {
        return { months, nearestMonthToToday };
      }

      const {
        month: monthKey,
        week: weekKey,
        day: dayKey,
      } = getTimingsKeys(getTimingBeginValue(timing), timezone, locale);

      const isNewMonth = getIsNewKey(months, monthKey);

      if (isNewMonth) {
        months.push({
          key: monthKey,
          diff: getMonthDiff(present.month, monthKey),
          current: presentMonthKey === monthKey,
          label: getMonthLabel(monthKey, locale),
          weeks: [],
          displayed: false,
        });
      }

      const month = months[months.length - 1];

      if (getIsNewKey(month.weeks, weekKey)) {
        month.weeks.push({
          key: weekKey,
          week: `${weekKey}`,
          label: `${weekKey}`,
          current: month.current && present.week === weekKey,
          days: [],
        });
      }

      const week = month.weeks[month.weeks.length - 1];

      if (getIsNewKey(week.days, dayKey)) {
        week.days.push({
          key: dayKey,
          day: dayKey,
          current: month.current && week.current && present.day === dayKey,
          passed: present.month + present.day > monthKey + dayKey,
          label: _.capitalize(
            tz(timing.begin, timezone).locale(locale).format('dddd D'),
          ),
          timings: [],
        });
      }

      week.days[week.days.length - 1].timings.push(timing);

      return {
        months,
        nearestMonthToToday: isNewMonth
          ? getNearestMonthToToday(presentMonthKey, nearestMonthToToday, months)
          : nearestMonthToToday,
      };
    },
    {
      months: [],
      nearestMonthToToday: {
        index: -1,
        value: null,
      },
    },
  );

  if (!result.months.length) {
    return [];
  }

  result.months[result.nearestMonthToToday.index].displayed = true;

  return result.months.map((month, index) =>
    Object.assign(month, {
      hasPrevious: index !== 0,
      hasNext: index !== result.months.length - 1,
    }));
};
