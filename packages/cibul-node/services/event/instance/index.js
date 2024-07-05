'use strict';

const range = require('@openagenda/date-range');
const utils = require('../../../lib/utils');

const config = require('../../../config');

const model = require('../../model');

const getTimings = require('../lib/getTimings');
const getClosestDate = require('../lib/getClosestDate');
const extractAttendanceMode = require('../lib/extractAttendanceMode');
const ics = require('./ics');
const state = require('./state');
const filterTimings = require('./filterTimings');

module.exports = instanciate;

function instanciate(data) {
  const instance = model.events().instance(data);

  const svcInstance = utils.extend({}, instance, {
    getImage: _imageGetter('getImage'),
    getThumbnail: _imageGetter('getThumbnail'),
    getFullImage: _imageGetter('getFullImage'),
    transferOwnership,
    getRange,
    getClosestDate: getClosestDate.bind(null, instance),
    getIcs,
  });

  Object.assign(svcInstance, extractAttendanceMode(data));

  state(svcInstance, instance, [
    'setState',
    'getState',
    'setOnStateChange',
  ]);

  return svcInstance;

  function transferOwnership(userId, cb) {
    instance.save({ ownerId: userId }, cb);
  }

  function getIcs(agenda, lang, decorate, timingIndex) {
    if (timingIndex === undefined) timingIndex = -1;

    return (decorate ? `${ics.head(agenda)}\n` : '')
    + ics(agenda, data, instance, lang, timingIndex)
    + (decorate ? '\nEND:VCALENDAR' : '');
  }

  function getRange(language, filter) {
    if (!language) {
      language = instance.getCurrentLanguage();
    }

    const timezone = instance.getLocationDetails()?.timezone || 'Europe/Paris';

    let timings = getTimings(instance);

    if (filter && (filter.from || filter.to)) {
      timings = filterTimings(timings, filter, timezone);
    }

    return range(timings.map(t => ({
      start: new Date(t.start),
      end: new Date(t.end),
    })), language, timezone);
  }

  function _imageGetter(method) {
    return function () {
      const image = instance[method]();

      if (!image) return image;

      return config.aws.imageBucketPath + image;
    };
  }
}
