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
      gte: thisYear.start,
      lte: thisYear.end
    };
  }

  if (differenceInCalendarDays(interval.end, interval.start) <= 365) {
    return {
      gte: interval.start,
      lte: interval.end
    };
  }

  if (getOverlappingDaysInIntervals(interval, thisYear)) {
    return {
      gte: thisYear.start,
      lte: thisYear.end
    };
  }

  if (getOverlappingDaysInIntervals(interval, nextYear)) {
    return {
      gte: nextYear.start,
      lte: nextYear.end
    };
  }

  if (isAfter(interval.start, now)) {
    return {
      gte: startOfYear(interval.start),
      lte: endOfYear(interval.start)
    };
  }

  return {
    gte: startOfYear(interval.end),
    lte: endOfYear(interval.end)
  };
}
