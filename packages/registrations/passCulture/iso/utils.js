import { format } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';
import _ from 'lodash';

const fZ = n => (n < 10 ? `0${n}` : n);

export function isFloatable(numOrStr) {
  const str = `${numOrStr}`;
  const num = parseFloat(str);
  return !Number.isNaN(num) && str === num.toString();
}

export function omit(obj, fields = []) {
  return Object.keys(obj).reduce(
    (filtered, key) => (fields.includes(key) ? filtered : Object.assign(filtered, { [key]: obj[key] })),
    {},
  );
}

export function pick(obj, fields = []) {
  return fields.reduce((c, f) => ({ ...c, [f]: obj[f] }), {});
}

export function flatten(label, requestedLang, options = {}) {
  const {
    fallbackLang = 'fr',
  } = options;

  if (typeof label === 'string') return label;

  for (const lang of [requestedLang, fallbackLang, Object.keys(label || {}).shift()]) {
    if (label?.[lang]) return label[lang];
  }
}

export function isDHMFormat(d) {
  return d.date && d.hours !== undefined && d.minutes !== undefined;
}

export function convertDHMToDate({ date, hours, minutes }, options = {}) {
  const {
    timezone = 'Europe/Paris',
  } = options;

  return new Date(zonedTimeToUtc(`${date}T${fZ(hours)}:${fZ(minutes)}:00`, timezone));
}

export function getTimingId(timing, timezone = 'Europe/Paris') {
  return (
    isDHMFormat(timing.begin) ? convertDHMToDate(timing.begin, { timezone }) : new Date(timing.begin)
  ).getTime();
}

export function getTimingLabel(timing, timezone = 'Europe/Paris') {
  return format(
    isDHMFormat(timing.begin) ? convertDHMToDate(timing.begin, { timezone }) : new Date(timing.begin),
    'yyyy-MM-dd HH:mm',
  );
}

export function getTime(d) {
  return (isDHMFormat(d) ? convertDHMToDate(d) : new Date(d)).getTime();
}

export function findTimingLabel(timings, timingId, options = {}) {
  const {
    throwNotFound = true,
  } = options;
  const timing = timings.find(t => getTimingId(t) === timingId);

  if (!timing && throwNotFound) {
    throw new Error(`Could not find timing matching ${timingId}`);
  }

  if (!timing) {
    return null;
  }

  return getTimingLabel(timing);
}

export function getRelatedFieldName(categories, category) {
  const enumValue = (categories.find(({ value }) => value === category)?.related ?? [])[0];
  return enumValue ? _.camelCase(enumValue.replace('Enum', '')) : undefined;
}
