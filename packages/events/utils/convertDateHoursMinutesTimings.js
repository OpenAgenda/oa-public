import logs from '@openagenda/logs';

import dateHoursMinutesTiming from '../iso/validators/dateHoursMinutesTiming.js';

import {
  from as convert,
  to as convertTo,
} from '../iso/convertDateHoursMinutesTiming.js';

const log = logs('convertDateMinuteHourTimings');

function convertDateHoursMinutesTimings(timings, timezone) {
  if (!timings || !timings.length) {
    return;
  }

  if (!dateHoursMinutesTiming.is(timings[0])) {
    return;
  }

  log('converting from DHM timings');

  timings.forEach((t) => {
    t.begin = convert(t.begin, timezone);
    t.end = convert(t.end, timezone);
  });
}

function to(timings, timezone) {
  if (!timings || !timings.length) {
    return;
  }

  if (dateHoursMinutesTiming.is(timings[0])) {
    return;
  }

  log('converting to DHM timings');

  timings.forEach((t) => {
    t.begin = convertTo(t.begin, timezone);
    t.end = convertTo(t.end, timezone);
  });
}

export default Object.assign(convertDateHoursMinutesTimings, { to });
