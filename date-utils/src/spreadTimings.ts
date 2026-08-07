import { format, getWeekOfMonth, startOfDay, Locale } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

type Options = {
  locale?: Locale;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
};

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
  options: Options = {},
): SpreadTimings {
  const { locale, weekStartsOn } = options;
  return timings.reduce((result, timing) => {
    const zonedBegin = utcToZonedTime(timing.begin, timezone);

    const monthKey = format(zonedBegin, 'yyyy-MM');
    const weekKey = getWeekOfMonth(zonedBegin, { locale, weekStartsOn });
    const dayKey = format(startOfDay(zonedBegin), 'yyyy-MM-dd');

    result[monthKey] = result[monthKey] || {};
    result[monthKey][weekKey] = result[monthKey][weekKey] || {};
    result[monthKey][weekKey][dayKey] = result[monthKey][weekKey][dayKey] || [];

    result[monthKey][weekKey][dayKey].push(timing);

    return result;
  }, {});
}
