import * as dateFns from 'date-fns';
import RRuleModule from 'rrule';
import getWeekOfMonth from './getWeekOfMonth.js';
import convertUTCDateToLocalDate from './convertUTCDateToLocalDate.js';
import convertLocalDateToUTCDate from './convertLocalDateToUTCDate.js';

const RRule = RRuleModule.default || RRuleModule;

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

  const ruleOptions = {
    wkst,
    until,
    dtstart: convertLocalDateToUTCDate(timing.begin),
    freq: RRule[options.frequence.toUpperCase()],
  };

  if (options.interval) {
    ruleOptions.interval = options.interval;
  }

  if (options.frequence === 'monthly') {
    if (options.monthlyIntervalType === 'weekday') {
      ruleOptions.byweekday = RRule[UTCweekdays[timing.begin.getUTCDay()]];
      ruleOptions.bysetpos = getWeekOfMonth(timing.begin);
    } else if (options.monthlyIntervalType === 'date') {
      ruleOptions.bymonthday = timing.begin.getDate();
    }
  } else if (options.frequence === 'weekly') {
    if (options.weekday?.length) {
      ruleOptions.byweekday = options.weekday.map(
        (v) => RRule[UTCweekdays[dayToUTCDay(v, weekStartsOn)]],
      );
    }
  }

  const rule = new RRule(ruleOptions);
  const begins = rule.all().map(convertUTCDateToLocalDate);
  const duration = timing.end.getTime() - timing.begin.getTime();

  return begins.map((v) => ({
    begin: v,
    end: new Date(v.getTime() + duration),
  }));
}
