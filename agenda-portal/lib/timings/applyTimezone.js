import moment from 'moment-timezone';
import { getValue as getBeginValue } from './begin.js';

const { tz } = moment;

export default (timing, timezone = 'Europe/Paris', locale = 'en') => ({
  ...timing,
  ...{
    start: tz(getBeginValue(timing), timezone).locale(locale).format(),
    end: tz(timing.end, timezone).locale(locale).format(),
  },
});
