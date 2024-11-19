import moment from 'moment-timezone';

const { tz } = moment;

export default (d, timezone) =>
  Math.ceil(
    (tz(d, timezone).diff(tz(d, timezone).date(1).day(1), 'days') + 1) / 7,
  );
