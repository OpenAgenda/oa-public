import {
  addDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  isSameDay,
  getISODay,
} from 'date-fns';
import { defineMessages } from 'react-intl';

const messages = defineMessages({
  today: {
    id: 'ReactFilters.dateRanges.today',
    defaultMessage: 'Today',
  },
  tomorrow: {
    id: 'ReactFilters.dateRanges.tomorrow',
    defaultMessage: 'Tomorrow',
  },
  thisWeekend: {
    id: 'ReactFilters.dateRanges.thisWeekend',
    defaultMessage: 'This week-end',
  },
  currentWeek: {
    id: 'ReactFilters.dateRanges.currentWeek',
    defaultMessage: 'Current week',
  },
  currentMonth: {
    id: 'ReactFilters.dateRanges.currentMonth',
    defaultMessage: 'Current month',
  },
});

function getClosestDayAfter(dayOfWeek, fromDate = new Date()) {
  const dayOfWeekMap = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thur: 4,
    Fri: 5,
    Sat: 6,
    Sun: 7,
  };
  const offsetDays = dayOfWeekMap[dayOfWeek] - getISODay(fromDate);
  return addDays(fromDate, offsetDays);
}

function isSelected(range, _timeZone) {
  const definedRange = this.range();

  return (
    range
    && (isSameDay(range.startDate, definedRange.startDate)
      || range.startDate === definedRange.startDate)
    && (isSameDay(range.endDate, definedRange.endDate)
      || range.endDate === definedRange.endDate)
  );
}

export function createStaticRanges(ranges) {
  return ranges.map(range => ({ isSelected, ...range }));
}

export default function dateRanges(intl, opts = {}) {
  const { dateFnsLocale } = opts;

  const nextSaturday = getClosestDayAfter('Sat');

  const startOfWeekend = startOfDay(nextSaturday);
  const endOfWeekend = endOfDay(addDays(nextSaturday, 1));
  const now = new Date();

  const defineds = {
    startOfToday: startOfDay(now, { locale: dateFnsLocale }),
    endOfToday: endOfDay(now, { locale: dateFnsLocale }),
    startOfTomorrow: startOfDay(addDays(now, 1), { locale: dateFnsLocale }),
    endOfTomorrow: endOfDay(addDays(now, 1), { locale: dateFnsLocale }),
    startOfWeek: startOfWeek(now, { locale: dateFnsLocale }),
    endOfWeek: endOfWeek(now, { locale: dateFnsLocale }),
    startOfMonth: startOfMonth(now, { locale: dateFnsLocale }),
    endOfMonth: endOfMonth(now, { locale: dateFnsLocale }),
    startOfWeekend,
    endOfWeekend,
  };

  const defaults = {
    staticRanges: createStaticRanges([
      {
        id: 'today',
        label: intl.formatMessage(messages.today),
        range: () => ({
          startDate: defineds.startOfToday,
          endDate: defineds.endOfToday,
        }),
      },
      {
        id: 'tomorrow',
        label: intl.formatMessage(messages.tomorrow),
        range: () => ({
          startDate: defineds.startOfTomorrow,
          endDate: defineds.endOfTomorrow,
        }),
      },
      {
        id: 'thisWeekend',
        label: intl.formatMessage(messages.thisWeekend),
        range: () => ({
          startDate: defineds.startOfWeekend,
          endDate: defineds.endOfWeekend,
        }),
      },
      {
        id: 'currentWeek',
        label: intl.formatMessage(messages.currentWeek),
        range: () => ({
          startDate: defineds.startOfWeek,
          endDate: defineds.endOfWeek,
        }),
      },
      {
        id: 'currentMonth',
        label: intl.formatMessage(messages.currentMonth),
        range: () => ({
          startDate: defineds.startOfMonth,
          endDate: defineds.endOfMonth,
        }),
      },
    ]),
    inputRanges: [],
  };

  return {
    staticRanges: opts.staticRanges
      ? opts.staticRanges.reduce((accu, next) => {
        if (typeof next === 'string') {
          const result = defaults.staticRanges.find(w => w.id === next);
          if (result) accu.push(result);
          else console.log(`Cannot found static range "${next}"`);
        } else {
          accu.push(next);
        }
        return accu;
      }, [])
      : defaults.staticRanges,
    inputRanges: opts.inputRanges || defaults.inputRanges,
  };
}
