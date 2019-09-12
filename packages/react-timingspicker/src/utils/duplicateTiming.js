import * as dateFns from 'date-fns';
import RRule from 'rrule';
import getWeekOfMonth from './getWeekOfMonth';
import convertUTCDateToLocalDate from './convertUTCDateToLocalDate';
import convertLocalDateToUTCDate from './convertLocalDateToUTCDate';

const UTCweekdays = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

function dayToUTCDay(value, weekStartsOn = 0) {
  return (7 + value + weekStartsOn) % 7;
}

function frequenceToAddFn(value) {
  switch (value) {
    case 'yearly':
      return dateFns.addYears;
    case 'monthly':
      return dateFns.addMonths;
    case 'weekly':
      return dateFns.addWeeks;
    case 'daily':
    default:
      return dateFns.addDays;
  }
}

export default function duplicateTiming(timing, options) {
  const weekStartsOn = options.weekStartsOn || 0;
  const wkst = RRule[UTCweekdays[weekStartsOn]];

  const addFn = frequenceToAddFn(options.frequence);

  const until = options.endType === 'until'
    ? new Date(options.until)
    : addFn(timing.begin, options.count || 1);
  const bymonthday = options.frequence === 'monthly' && options.monthlyIntervalType === 'date'
    ? timing.begin.getDate()
    : undefined;
  const bysetpos = options.frequence === 'monthly' && options.monthlyIntervalType === 'weekday'
    ? getWeekOfMonth(timing.begin)
    : undefined;
  let byweekday;

  if (
    options.frequence === 'weekly'
    && options.weekday
    && options.weekday.length
  ) {
    byweekday = options.weekday.map(
      v => RRule[UTCweekdays[dayToUTCDay(v, weekStartsOn)]]
    );
  } else if (
    options.frequence === 'monthly'
    && options.monthlyIntervalType === 'weekday'
  ) {
    byweekday = RRule[UTCweekdays[timing.begin.getUTCDay()]];
  }

  const rule = new RRule({
    wkst,
    dtstart: convertLocalDateToUTCDate(timing.begin),
    freq: RRule[options.frequence.toUpperCase()],
    interval: options.interval,
    until,
    byweekday,
    bymonthday,
    bysetpos
  });

  const begins = rule.all().map(convertUTCDateToLocalDate);
  const duration = timing.end.getTime() - timing.begin.getTime();

  return begins.map(v => ({
    begin: v,
    end: new Date(v.getTime() + duration)
  }));
}
