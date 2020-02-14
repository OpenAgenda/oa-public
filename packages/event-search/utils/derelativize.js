'use strict';

const _ = require('lodash');
const ih = require('immutability-helper');
const moment = require('moment-timezone');

module.exports = (query = {}) => {
  const timezone = _.get(query, 'date.timezone');

  if (!timezone) return query;

  _validateTimezone(timezone);

  const localMidnightToday = _getMidnight(timezone);

  const timestampFields = Object.keys(query.date || {})
    .filter(f => f !== 'timezone');

  return ih(query, timestampFields.reduce((update, field) => {
    if (query.date[field] !== 'today') {
      return update
    }
    return _.set(update, ['date', field], { $set: localMidnightToday });
  }, { date: { $unset: ['timezone'] } }));
}


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
