import _ from 'lodash';
import qs from 'qs';

const eventWithDefaults = (event, defaults) => {
  if (!defaults?.event) return event;

  return {
    ...defaults.event,
    ...event
  };
};

const get = () => {
  const parts = (window?.location?.href || '').split('?');

  if (parts.length < 2) {
    return;
  }

  parts.shift();

  const query = qs.parse(parts.join('?'));

  return query?.defaults || {};
};

export default {
  get,
  eventWithDefaults 
};