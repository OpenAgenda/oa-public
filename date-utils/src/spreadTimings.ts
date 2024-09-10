import { format, getWeekOfMonth, startOfDay } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

type Timing = {
  begin: string;
  end: string;
};

export type SpreadTimings = {
  [month: string]: {
    [week: string]: {
      [day: string]: Timing[];
    };
  };
};

export default function spreadTimings(
  timings: Timing[],
  timezone: string,
): SpreadTimings {
  return timings.reduce((result, timing) => {
    const zonedBegin = utcToZonedTime(timing.begin, timezone);

    const monthKey = format(zonedBegin, 'yyyy-MM');
    const weekKey = getWeekOfMonth(zonedBegin);
    const dayKey = format(startOfDay(zonedBegin), 'yyyy-MM-dd');

    result[monthKey] = result[monthKey] || {};
    result[monthKey][weekKey] = result[monthKey][weekKey] || {};
    result[monthKey][weekKey][dayKey] = result[monthKey][weekKey][dayKey] || [];

    result[monthKey][weekKey][dayKey].push(timing);

    return result;
  }, {});
}
