import {
  addDays,
  endOfDay,
  startOfDay,
  startOfMonth,
  endOfMonth,
  addMonths,
  startOfWeek,
  endOfWeek,
  isSameDay,
  differenceInCalendarDays
} from 'date-fns';
import * as dateFnsLocales from 'date-fns/locale';
import { defineMessages } from 'react-intl';

const messages = defineMessages({
  today: {
    id: 'AgendaStats.dateRanges.today',
    defaultMessage: 'Today'
  },
  yesterday: {
    id: 'AgendaStats.dateRanges.yesterday',
    defaultMessage: 'Yesterday'
  },
  thisWeek: {
    id: 'AgendaStats.dateRanges.thisWeek',
    defaultMessage: 'This Week'
  },
  lastWeek: {
    id: 'AgendaStats.dateRanges.lastWeek',
    defaultMessage: 'Last Week'
  },
  thisMonth: {
    id: 'AgendaStats.dateRanges.thisMonth',
    defaultMessage: 'This Month'
  },
  lastMonth: {
    id: 'AgendaStats.dateRanges.lastMonth',
    defaultMessage: 'Last Month'
  },
  daysUpToToday: {
    id: 'AgendaStats.dateRanges.daysUpToToday',
    defaultMessage: 'days up to today'
  },
  daysStartingToday: {
    id: 'AgendaStats.dateRanges.daysStartingToday',
    defaultMessage: 'days starting today'
  }
});

const staticRangeHandler = {
  range: {},
  isSelected(range) {
    const definedRange = this.range();
    return (
      isSameDay(range.startDate, definedRange.startDate)
      && isSameDay(range.endDate, definedRange.endDate)
    );
  }
};

export function createStaticRanges(ranges) {
  return ranges.map(range => ({ ...staticRangeHandler, ...range }));
}

export default function dateRanges(intl) {
  const locale = dateFnsLocales[intl.locale];

  const defineds = {
    startOfWeek: startOfWeek(new Date(), { locale }),
    endOfWeek: endOfWeek(new Date(), { locale }),
    startOfLastWeek: startOfWeek(addDays(new Date(), -7), { locale }),
    endOfLastWeek: endOfWeek(addDays(new Date(), -7), { locale }),
    startOfToday: startOfDay(new Date()),
    endOfToday: endOfDay(new Date()),
    startOfYesterday: startOfDay(addDays(new Date(), -1)),
    endOfYesterday: endOfDay(addDays(new Date(), -1)),
    startOfMonth: startOfMonth(new Date()),
    endOfMonth: endOfMonth(new Date()),
    startOfLastMonth: startOfMonth(addMonths(new Date(), -1)),
    endOfLastMonth: endOfMonth(addMonths(new Date(), -1))
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
        label: intl.formatMessage(messages.yesterday),
        range: () => ({
          startDate: defineds.startOfYesterday,
          endDate: defineds.endOfYesterday
        })
      },

      {
        label: intl.formatMessage(messages.thisWeek),
        range: () => ({
          startDate: defineds.startOfWeek,
          endDate: defineds.endOfWeek
        })
      },
      {
        label: intl.formatMessage(messages.lastWeek),
        range: () => ({
          startDate: defineds.startOfLastWeek,
          endDate: defineds.endOfLastWeek
        })
      },
      {
        label: intl.formatMessage(messages.thisMonth),
        range: () => ({
          startDate: defineds.startOfMonth,
          endDate: defineds.endOfMonth
        })
      },
      {
        label: intl.formatMessage(messages.lastMonth),
        range: () => ({
          startDate: defineds.startOfLastMonth,
          endDate: defineds.endOfLastMonth
        })
      }
    ]),
    inputRanges: [
      {
        label: intl.formatMessage(messages.daysUpToToday),
        range(value) {
          return {
            startDate: addDays(
              defineds.startOfToday,
              (Math.max(Number(value), 1) - 1) * -1
            ),
            endDate: defineds.endOfToday
          };
        },
        getCurrentValue(range) {
          if (!isSameDay(range.endDate, defineds.endOfToday)) return '-';
          if (!range.startDate) return '∞';
          return (
            differenceInCalendarDays(defineds.endOfToday, range.startDate) + 1
          );
        }
      },
      {
        label: intl.formatMessage(messages.daysStartingToday),
        range(value) {
          const today = new Date();
          return {
            startDate: today,
            endDate: addDays(today, Math.max(Number(value), 1) - 1)
          };
        },
        getCurrentValue(range) {
          if (!isSameDay(range.startDate, defineds.startOfToday)) return '-';
          if (!range.endDate) return '∞';
          return (
            differenceInCalendarDays(range.endDate, defineds.startOfToday) + 1
          );
        }
      }
    ]
  };
}
