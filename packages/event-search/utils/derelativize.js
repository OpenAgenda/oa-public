'use strict';

const moment = require('moment-timezone');
const { produce } = require('immer');

module.exports = produce(query => {
  const timezone = query?.date?.timezone;

  if (!timezone) return;

  _validateTimezone(timezone);

  const localMidnightToday = _getMidnight(timezone);

  delete query.date.timezone;

  const timestampFieldsWithToday = Object
    .keys(query.date || {})
    .filter(f => f !== 'timezone')
    .filter(f => query.date[f] === 'today');

  for (const field of timestampFieldsWithToday) {
    query.date[field] = localMidnightToday;
  }
});


function _getMidnight(timezone) {
  const local = moment.tz(timezone).format('HH:mm');
  const [hours, minutes] = local.split(':');

  const localMidnight = new Date;

  localMidnight.setHours(localMidnight.getHours() - parseInt(hours));
  localMidnight.setMinutes(localMidnight.getMinutes() - parseInt(minutes));
  localMidnight.setSeconds(0);
  localMidnight.setMilliseconds(0);

  return localMidnight;
}

function _validateTimezone(tz) {
  if (!Intl || !Intl.DateTimeFormat().resolvedOptions().timeZone) {
    throw 'Time zones are not available in this environment';
  }

  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
  } catch (e) {
    throw new Error( 'Invalid timezone');
  }
}
