import moment from 'moment-timezone';
import {
  getKey as getBeginKey,
  getValue as getBeginValue,
} from '../timings/begin.js';

const { tz } = moment;

export default (timing, timezone = 'Europe/Paris', locale = 'en') =>
  Object.assign(timing, {
    labels: {
      [getBeginKey(timing)]: {
        day: tz(getBeginValue(timing), timezone).locale(locale).format('LL'),
        time: tz(getBeginValue(timing), timezone).locale(locale).format('LT'),
      },
      end: {
        day: tz(getBeginValue(timing), timezone).locale(locale).format('LL'),
        time: tz(timing.end, timezone).locale(locale).format('LT'),
      },
    },
  });
