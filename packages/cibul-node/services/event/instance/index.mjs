import range from '@openagenda/date-range';
import config from '../../../config/index.mjs';
import model from '../../model/index.mjs';
import getTimings from '../lib/getTimings.mjs';
import getClosestDate from '../lib/getClosestDate.mjs';
import extractAttendanceMode from '../lib/extractAttendanceMode.mjs';
import ics from './ics.mjs';
import state from './state.mjs';
import filterTimings from './filterTimings.mjs';

export default function instanciate(data) {
  const instance = model.events().instance(data);

  function transferOwnership(userId, cb) {
    instance.save({ ownerId: userId }, cb);
  }

  function getIcs(agenda, lang, decorate, timingIndex) {
    // eslint-disable-next-line no-param-reassign
    if (timingIndex === undefined) timingIndex = -1;

    return (decorate ? `${ics.head(agenda)}\n` : '')
      + ics(agenda, data, instance, lang, timingIndex)
      + (decorate ? '\nEND:VCALENDAR' : '');
  }

  function getRange(language, filter) {
    if (!language) {
      // eslint-disable-next-line no-param-reassign
      language = instance.getCurrentLanguage();
    }

    const timezone = instance.getLocationDetails()?.timezone || 'Europe/Paris';

    let timings = getTimings(instance);

    if (filter && (filter.from || filter.to)) {
      timings = filterTimings(timings, filter, timezone);
    }

    return range(timings.map(t => ({
      start: new Date(t.start),
      end: new Date(t.end),
    })), language, timezone);
  }

  function _imageGetter(method) {
    return () => {
      const image = instance[method]();

      if (!image) return image;

      return config.aws.imageBucketPath + image;
    };
  }

  const svcInstance = {
    ...instance,
    getImage: _imageGetter('getImage'),
    getThumbnail: _imageGetter('getThumbnail'),
    getFullImage: _imageGetter('getFullImage'),
    transferOwnership,
    getRange,
    getClosestDate: getClosestDate.bind(null, instance),
    getIcs,
  };

  Object.assign(svcInstance, extractAttendanceMode(data));

  state(svcInstance, instance, [
    'setState',
    'getState',
    'setOnStateChange',
  ]);

  return svcInstance;
}
