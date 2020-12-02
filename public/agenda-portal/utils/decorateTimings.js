'use strict';

const moment = require('moment-timezone');

const decorateTiming = (timing, timezone, formats = []) => formats.reduce(
  (t, {
    src, dst, format, locale
  }) => ({
    ...t,
    [dst]: moment
      .tz(t[src], timezone)
      .locale(locale || 'fr')
      .format(format)
  }),
  timing
);

module.exports = (t, timezone, formats = []) => (t instanceof Array
  ? t.map(timing => decorateTiming(timing, timezone, formats))
  : decorateTiming(t, timezone, formats));
