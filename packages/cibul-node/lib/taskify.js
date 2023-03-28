'use strict';

const moment = require('moment');

const utils = require('@openagenda/utils');

function _setBootOffset(params) {
  const { period, day, time } = params;

  if (!time) return 0;

  const [hour, minute] = time.split(':');

  const now = moment.utc().locale('en');
  const nextTime = now.clone();

  if (day) {
    nextTime.startOf('week').day(day);
  }

  nextTime.hour(hour).minute(minute);

  if (nextTime.isBefore(now)) {
    if (period === 'weekly') {
      nextTime.add(1, 'week');
    } else {
      nextTime.add(1, 'day');
    }
  }

  return nextTime.diff(now);
}

/**
 * prepare task for periodic and offsetted runs
 */

module.exports = (run, options) => {
  const params = utils.extend({
    period: false, // periodicity of the task
    bootOffset: 0, // offset time at which task will do its first run
  }, options || {});

  if (!params.bootOffset) {
    params.bootOffset = _setBootOffset(params);
  }

  if (params.period === 'hourly') {
    params.period = 60000 * 60;
  }

  if (params.period === 'daily') {
    params.period = 60000 * 60 * 24;
  }

  if (params.period === 'weekly') {
    params.period = 60000 * 60 * 24 * 7;
  }

  setTimeout(() => {
    run();

    if (params.period !== false) {
      setInterval(run, params.period);
    }
  }, params.bootOffset);
};
