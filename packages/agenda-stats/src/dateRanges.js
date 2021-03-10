import {
  addDays,
  addMonths,
  addYears,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfYear,
  endOfYear,
  isSameDay,
  differenceInCalendarDays,
} from 'date-fns';
import * as dateFnsLocales from 'date-fns/locale';
import { defineMessages } from 'react-intl';

const messages = defineMessages({
  currentWeek: {
    id: 'AgendaStats.dateRanges.currentWeek',
    defaultMessage: 'Current week',
  },
  lastWeek: {
    id: 'AgendaStats.dateRanges.lastWeek',
    defaultMessage: 'Last week',
  },
  currentMonth: {
    id: 'AgendaStats.dateRanges.currentMonth',
    defaultMessage: 'Current month',
  },
  lastMonth: {
    id: 'AgendaStats.dateRanges.lastMonth',
    defaultMessage: 'Last month',
  },
  currentYear: {
    id: 'AgendaStats.dateRanges.currentYear',
    defaultMessage: 'Current year',
  },
  lastYear: {
    id: 'AgendaStats.dateRanges.lastYear',
    defaultMessage: 'Last year',
  },
  daysUpToToday: {
    id: 'AgendaStats.dateRanges.daysUpToToday',
    defaultMessage: 'days up to today',
  },
  daysStartingToday: {
    id: 'AgendaStats.dateRanges.daysStartingToday',
    defaultMessage: 'days starting today',
  },
});

const staticRangeHandler = {
  isSelected(range) {
    const definedRange = this.range();
    return (
      isSameDay(range.startDate, definedRange.startDate)
      && isSameDay(range.endDate, definedRange.endDate)
    );
  },
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
    startOfMonth: startOfMonth(new Date()),
    endOfMonth: endOfMonth(new Date()),
    startOfLastMonth: startOfMonth(addMonths(new Date(), -1)),
    endOfLastMonth: endOfMonth(addMonths(new Date(), -1)),
    startOfYear: startOfYear(new Date()),
    endOfYear: endOfYear(new Date()),
    startOfLastYear: startOfYear(addYears(new Date(), -1)),
    endOfLastYear: endOfYear(addYears(new Date(), -1)),
  };

  return {
    staticRanges: createStaticRanges([
      {
        label: intl.formatMessage(messages.currentWeek),
        range: () => ({
          startDate: defineds.startOfWeek,
          endDate: defineds.endOfWeek,
        }),
      },
      {
        label: intl.formatMessage(messages.lastWeek),
        range: () => ({
          startDate: defineds.startOfLastWeek,
          endDate: defineds.endOfLastWeek,
        }),
      },
      {
        label: intl.formatMessage(messages.currentMonth),
        range: () => ({
          startDate: defineds.startOfMonth,
          endDate: defineds.endOfMonth,
        }),
      },
      {
        label: intl.formatMessage(messages.lastMonth),
        range: () => ({
          startDate: defineds.startOfLastMonth,
          endDate: defineds.endOfLastMonth,
        }),
      },
      {
        label: intl.formatMessage(messages.currentYear),
        range: () => ({
          startDate: defineds.startOfYear,
          endDate: defineds.endOfYear,
        }),
      },
      {
        label: intl.formatMessage(messages.lastYear),
        range: () => ({
          startDate: defineds.startOfLastYear,
          endDate: defineds.endOfLastYear,
        }),
      },
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
            endDate: defineds.endOfToday,
          };
        },
        getCurrentValue(range) {
          if (!isSameDay(range.endDate, defineds.endOfToday)) return '-';
          if (!range.startDate) return '∞';
          return (
            differenceInCalendarDays(defineds.endOfToday, range.startDate) + 1
          );
        },
      },
      {
        label: intl.formatMessage(messages.daysStartingToday),
        range(value) {
          const today = new Date();
          return {
            startDate: today,
            endDate: addDays(today, Math.max(Number(value), 1) - 1),
          };
        },
        getCurrentValue(range) {
          if (!isSameDay(range.startDate, defineds.startOfToday)) return '-';
          if (!range.endDate) return '∞';
          return (
            differenceInCalendarDays(range.endDate, defineds.startOfToday) + 1
          );
        },
      },
    ],
  };
}
