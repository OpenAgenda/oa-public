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

export function get() {
  const parts = (window?.location?.href || '').split('?');

  if (parts.length < 2) {
    return {};
  }

  parts.shift();

  const query = qs.parse(parts.join('?'));

  return query?.defaults || {};
}

export default {
  get,
  eventWithDefaults
};
