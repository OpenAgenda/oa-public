import { differenceInCalendarDays } from 'date-fns';

const BREAKPOINTS_BY_WIDTH = {
  1: [31, 183],
  2: [61, 366]
};

export default function rangeToCalendarInterval(range, chartWidth = 1) {
  if (!range) {
    return null;
  }

  const rangeDurationInDays = differenceInCalendarDays(
    range.endDate,
    range.startDate
  );

  const [dayBreakpoint, weekBreakpoint] = BREAKPOINTS_BY_WIDTH[chartWidth];

  if (rangeDurationInDays <= dayBreakpoint) {
    return 'day';
  }

  if (
    rangeDurationInDays > dayBreakpoint
    && rangeDurationInDays <= weekBreakpoint
  ) {
    return 'week';
  }

  return 'month';
}
