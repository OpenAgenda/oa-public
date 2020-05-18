import { differenceInCalendarDays } from 'date-fns';

export default function rangeToCalendarInterval(range) {
  if (!range) {
    return null;
  }

  const rangeDurationInDays = differenceInCalendarDays(
    range.endDate,
    range.startDate
  );

  if (rangeDurationInDays <= 31) {
    return 'day';
  }

  if (rangeDurationInDays > 31 && rangeDurationInDays <= 183) {
    return 'week';
  }

  return 'month';
}
