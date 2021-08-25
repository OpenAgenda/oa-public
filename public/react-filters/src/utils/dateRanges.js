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
import * as dateFnsLocales from 'date-fns/locale';
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

function isSelected(range) {
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
  const locale = dateFnsLocales[intl.locale];

  const nextSaturday = getClosestDayAfter('Sat');

  const startOfWeekend = startOfDay(nextSaturday);
  const endOfWeekend = endOfDay(addDays(nextSaturday, 1));
  const now = new Date();

  const defineds = {
    startOfToday: startOfDay(now, { locale }),
    endOfToday: endOfDay(now, { locale }),
    startOfTomorrow: startOfDay(addDays(now, 1), { locale }),
    endOfTomorrow: endOfDay(addDays(now, 1), { locale }),
    startOfWeek: startOfWeek(now, { locale }),
    endOfWeek: endOfWeek(now, { locale }),
    startOfMonth: startOfMonth(now, { locale }),
    endOfMonth: endOfMonth(now, { locale }),
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
    staticRanges: opts.staticRanges ? opts.staticRanges.map(v => {
      if (typeof v === 'string') {
        const result = defaults.staticRanges.find(w => w.id === v);
        if (result) {
          return result;
        }
      }
      return v;
    }) : defaults.staticRanges,
    inputRanges: opts.inputRanges || defaults.inputRanges,
  };
}
