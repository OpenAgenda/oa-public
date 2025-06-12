import _ from 'lodash';
import { formatInTimeZone } from 'date-fns-tz';

import { spreadTimings } from '@openagenda/date-utils';
import fr from 'date-fns/locale/fr/index.js';
import de from 'date-fns/locale/de/index.js';
import it from 'date-fns/locale/it/index.js';
import es from 'date-fns/locale/es/index.js';

const locales = {
  fr,
  de,
  it,
  es,
};

const formatTimingLabel = (t, timezone, lang) =>
  formatInTimeZone(new Date(t.begin), timezone, 'HH:mm', {
    locale: locales[lang],
  });

const formatDateLabel = (date, timezone, lang) =>
  formatInTimeZone(new Date(date), timezone, 'EEEE d', {
    locale: locales[lang],
  });

const formatMonthLabel = (month, timezone, lang) =>
  _.capitalize(
    formatInTimeZone(new Date(month), timezone, 'MMMM yyyy', {
      locale: locales[lang],
    }),
  );

export function getTimingMonthSegments({ value, relatedValues, lang }) {
  const { timezone = 'Europe/Paris' } = relatedValues;

  const datesByMonth = spreadTimings(value, timezone, { weekStartsOn: 1 });

  return Object.keys(datesByMonth).map((month) => ({
    value: month,
    label: formatMonthLabel(month, timezone, lang),
    weeks: Object.keys(datesByMonth[month]).map((week) => ({
      value: week,
      dates: Object.keys(datesByMonth[month][week]).map((date) => ({
        label: formatDateLabel(date, timezone, lang),
        value: date,
        timings: datesByMonth[month][week][date].map((t) => ({
          value: t,
          label: formatTimingLabel(t, timezone, lang),
        })),
      })),
    })),
  }));
}

export function areTimings(value) {
  if (!Array.isArray(value) || !value?.length) {
    return false;
  }
  const [timing] = value;

  return !!timing.begin;
}

export function keepDates(
  month,
  fromWeekIndex = 0,
  fromDateIndex = 0,
  count = -1,
) {
  const kept = {
    ...month,
    weeks: [],
  };

  let keptDates = 0;
  for (const [weekIndex, week] of month.weeks.entries()) {
    if (weekIndex < fromWeekIndex) {
      continue;
    }
    kept.weeks.push({
      ...week,
      dates: [],
    });
    for (const [dateIndex, date] of month.weeks[weekIndex].dates.entries()) {
      if (weekIndex === fromWeekIndex && dateIndex < fromDateIndex) {
        continue;
      }
      kept.weeks[kept.weeks.length - 1].dates.push(date);
      keptDates += 1;
      if (count !== -1 && count === keptDates) {
        return kept;
      }
    }
  }
  return kept;
}
