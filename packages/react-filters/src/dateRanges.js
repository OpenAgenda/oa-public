import {
  addDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  isSameDay,
  eachWeekendOfInterval
} from 'date-fns';
import * as dateFnsLocales from 'date-fns/locale';
import { defineMessages } from 'react-intl';

const messages = defineMessages({
  lastWeek: {
    id: 'ReactFilters.dateRanges.lastWeek',
    defaultMessage: 'Last week'
  },
  lastMonth: {
    id: 'ReactFilters.dateRanges.lastMonth',
    defaultMessage: 'Last month'
  },
  currentYear: {
    id: 'ReactFilters.dateRanges.currentYear',
    defaultMessage: 'Current year'
  },
  lastYear: {
    id: 'ReactFilters.dateRanges.lastYear',
    defaultMessage: 'Last year'
  },
  daysUpToToday: {
    id: 'ReactFilters.dateRanges.daysUpToToday',
    defaultMessage: 'days up to today'
  },
  daysStartingToday: {
    id: 'ReactFilters.dateRanges.daysStartingToday',
    defaultMessage: 'days starting today'
  },

  today: {
    id: 'ReactFilters.dateRanges.today',
    defaultMessage: 'Today'
  },
  tomorrow: {
    id: 'ReactFilters.dateRanges.tomorrow',
    defaultMessage: 'Tomorrow'
  },
  thisWeekend: {
    id: 'ReactFilters.dateRanges.thisWeekend',
    defaultMessage: 'This week-end'
  },
  currentWeek: {
    id: 'ReactFilters.dateRanges.currentWeek',
    defaultMessage: 'Current week'
  },
  currentMonth: {
    id: 'ReactFilters.dateRanges.currentMonth',
    defaultMessage: 'Current month'
  }
});

const staticRangeHandler = {
  isSelected(range) {
    const definedRange = this.range();

    return (
      range
      && isSameDay(range.startDate, definedRange.startDate)
      && isSameDay(range.endDate, definedRange.endDate)
    );
  }
};

export function createStaticRanges(ranges) {
  return ranges.map(range => ({ ...staticRangeHandler, ...range }));
}

export default function dateRanges(intl) {
  const locale = dateFnsLocales[intl.locale];

  const [startOfWeekend, endOfWeekend] = eachWeekendOfInterval({
    start: startOfWeek(new Date(), { locale }),
    end: endOfWeek(new Date(), { locale })
  });

  const defineds = {
    startOfToday: startOfDay(new Date(), { locale }),
    endOfToday: endOfDay(new Date(), { locale }),
    startOfTomorrow: startOfDay(addDays(new Date(), 1), { locale }),
    endOfTomorrow: endOfDay(addDays(new Date(), 1), { locale }),
    startOfWeek: startOfWeek(new Date(), { locale }),
    endOfWeek: endOfWeek(new Date(), { locale }),
    startOfMonth: startOfMonth(new Date(), { locale }),
    endOfMonth: endOfMonth(new Date(), { locale }),
    startOfWeekend,
    endOfWeekend
  };

  return {
    staticRanges: createStaticRanges([
      {
        label: intl.formatMessage(messages.today),
        range: () => ({
          startDate: defineds.startOfToday,
          endDate: defineds.endOfToday
        })
      },
      {
        label: intl.formatMessage(messages.tomorrow),
        range: () => ({
          startDate: defineds.startOfTomorrow,
          endDate: defineds.endOfTomorrow
        })
      },
      {
        label: intl.formatMessage(messages.thisWeekend),
        range: () => ({
          startDate: defineds.startOfWeekend,
          endDate: defineds.endOfWeekend
        })
      },
      {
        label: intl.formatMessage(messages.currentWeek),
        range: () => ({
          startDate: defineds.startOfWeek,
          endDate: defineds.endOfWeek
        })
      },
      {
        label: intl.formatMessage(messages.currentMonth),
        range: () => ({
          startDate: defineds.startOfMonth,
          endDate: defineds.endOfMonth
        })
      }
    ]),
    inputRanges: []
  };
}
