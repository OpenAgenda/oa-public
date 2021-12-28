import debug from 'debug';
import qs from 'qs';

const log = debug('URLDefaults');

export function eventWithDefaults(event, defaults) {
  log('eventWithDefaults', event, defaults);
  if (!defaults?.event) {
    return event;
  }

  return {
    ...defaults.event,
    ...event
  };
}

export function get(history) {
  if (!history.location.search) {
    return {};
  }

  return qs.parse(history.location.search, { ignoreQueryPrefix: true })?.defaults ?? {};
}

export default {
  get,
  eventWithDefaults
};
