import _ from 'lodash';
import { format, parseISO } from 'date-fns';
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

// The month and day keys spreadTimings returns ("2026-09", "2026-09-18") are
// already wall-clock calendar values in the event timezone — the zone did its
// work when the key was built and is gone from the string. They must therefore
// be formatted as calendar values: `new Date()` would read them as UTC
// midnight, and shifting that back into a negative offset lands on the day
// before (event 4901119, 18 September in America/Martinique, was titled
// "Août 2026" over "jeudi 17"). parseISO reads a date-only string as local
// midnight, which `format` then prints back verbatim, whatever the server
// timezone.
const formatDateLabel = (date, lang) =>
  format(parseISO(date), 'EEEE d', {
    locale: locales[lang],
  });

const formatMonthLabel = (month, lang) =>
  _.capitalize(
    format(parseISO(month), 'MMMM yyyy', {
      locale: locales[lang],
    }),
  );

export function getTimingMonthSegments({ value, relatedValues, lang }) {
  const { timezone = 'Europe/Paris' } = relatedValues;

  const datesByMonth = spreadTimings(value, timezone, { weekStartsOn: 1 });

  return Object.keys(datesByMonth).map((month) => ({
    value: month,
    label: formatMonthLabel(month, lang),
    weeks: Object.keys(datesByMonth[month]).map((week) => ({
      value: week,
      dates: Object.keys(datesByMonth[month][week]).map((date) => ({
        label: formatDateLabel(date, lang),
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
