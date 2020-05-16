import {
  addYears,
  differenceInCalendarDays,
  endOfYear,
  getOverlappingDaysInIntervals,
  isAfter,
  startOfYear
} from 'date-fns';

export default function determineDefaultRange({ first, last }) {
  const now = new Date();
  const datePlusOneYear = addYears(now, 1);
  const thisYear = { start: startOfYear(now), end: endOfYear(now) };
  const nextYear = {
    start: startOfYear(datePlusOneYear),
    end: endOfYear(datePlusOneYear)
  };
  const interval = { start: new Date(first), end: new Date(last) };

  if (!first) {
    // Nothing to display
    return {
      startDate: thisYear.start,
      endDate: thisYear.end
    };
  }

  if (differenceInCalendarDays(interval.end, interval.start) <= 365) {
    return {
      startDate: interval.start,
      endDate: interval.end
    };
  }

  if (getOverlappingDaysInIntervals(interval, thisYear)) {
    return {
      startDate: thisYear.start,
      endDate: thisYear.end
    };
  }

  if (getOverlappingDaysInIntervals(interval, nextYear)) {
    return {
      startDate: nextYear.start,
      endDate: nextYear.end
    };
  }

  if (isAfter(interval.start, now)) {
    return {
      startDate: startOfYear(interval.start),
      endDate: endOfYear(interval.start)
    };
  }

  return {
    startDate: startOfYear(interval.end),
    endDate: endOfYear(interval.end)
  };
}
