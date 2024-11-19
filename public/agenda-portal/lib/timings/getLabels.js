import moment from 'moment-timezone';
import { getKey as getBeginKey, getValue as getBeginValue } from './begin.js';

const { tz } = moment;

export default (timing, timezone, locale = 'en') => {
  const beginKey = getBeginKey(timing);
  const beginValue = getBeginValue(timing);

  return {
    [beginKey]: {
      day: tz(beginValue, timezone).locale(locale).format('dddd D'),
      time: tz(beginValue, timezone).locale(locale).format('LT'),
    },
    end: {
      day: tz(beginValue, timezone).locale(locale).format('dddd D'),
      time: tz(timing.end, timezone).locale(locale).format('LT'),
    },
  };
};
