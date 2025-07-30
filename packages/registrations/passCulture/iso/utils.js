import { format } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';
import { produce } from 'immer';
import _ from 'lodash';

const fZ = (n) => (n < 10 ? `0${n}` : n);

export function isFloatable(numOrStr) {
  const str = `${numOrStr}`;
  const num = parseFloat(str);
  return !Number.isNaN(num) && str === num.toString();
}

export function omit(obj, fields = []) {
  return Object.keys(obj).reduce(
    (filtered, key) =>
      (fields.includes(key)
        ? filtered
        : Object.assign(filtered, { [key]: obj[key] })),
    {},
  );
}

export function pick(obj, fields = []) {
  return fields.reduce((c, f) => ({ ...c, [f]: obj[f] }), {});
}

export function flatten(label, requestedLang, options = {}) {
  const { fallbackLang = 'fr' } = options;

  if (typeof label === 'string') return label;

  for (const lang of [
    requestedLang,
    fallbackLang,
    Object.keys(label || {}).shift(),
  ]) {
    if (label?.[lang]) return label[lang];
  }
}

export function isDHMFormat(d) {
  return d.date && d.hours !== undefined && d.minutes !== undefined;
}

export function convertDHMToDate({ date, hours, minutes }, options = {}) {
  const { timezone = 'Europe/Paris' } = options;

  return new Date(
    zonedTimeToUtc(`${date}T${fZ(hours)}:${fZ(minutes)}:00`, timezone),
  );
}

export function getTimingId(timing, timezone = 'Europe/Paris') {
  return (
    isDHMFormat(timing.begin)
      ? convertDHMToDate(timing.begin, { timezone })
      : new Date(timing.begin)
  ).getTime();
}

export function getTimingLabel(timing, timezone = 'Europe/Paris') {
  return format(
    isDHMFormat(timing.begin)
      ? convertDHMToDate(timing.begin, { timezone })
      : new Date(timing.begin),
    'yyyy-MM-dd HH:mm',
  );
}

export function getTime(d) {
  return (isDHMFormat(d) ? convertDHMToDate(d) : new Date(d)).getTime();
}

export function findTimingLabel(timings, timingId, options = {}) {
  const { throwNotFound = true } = options;
  const timing = timings.find((t) => getTimingId(t) === timingId);

  if (!timing && throwNotFound) {
    throw new Error(`Could not find timing matching ${timingId}`);
  }

  if (!timing) {
    return null;
  }

  return getTimingLabel(timing);
}

export function getRelatedFieldName(categories, category) {
  const enumValue = (categories.find(({ value }) => value === category)
    ?.related ?? [])[0];
  return enumValue ? _.camelCase(enumValue.replace('Enum', '')) : undefined;
}

export function getRelatedFieldOptions(related, relatedFieldName) {
  const enumValue = `${relatedFieldName.replace(/^\w/, (c) => c.toUpperCase())}Enum`;

  return related.find(({ schema }) => schema === enumValue)?.options ?? [];
}

const getCurrentValueArrayHandler = (initialAcc, objArr) =>
  (initialAcc
    ? objArr.reduce((acc, item) => {
      const accIndex = acc.findIndex(({ id }) => id === item.id);

      if (accIndex === -1) {
        return acc.concat(item);
      }

      acc[accIndex] = { ...acc[accIndex], ...item };
      return acc;
    }, initialAcc)
    : objArr);

export function getCurrentValue(data) {
  if (!Array.isArray(data) && !data?.response) {
    return data || {};
  }
  const dataWithResponse = produce([].concat(data), (draft) =>
    draft.reduce(
      (carry, patch) =>
        carry.concat(
          _.omit(patch, 'response'),
          patch?.response ? patch.response : [],
        ),
      [],
    ));
  const result = dataWithResponse.reduce((acc, obj) => {
    Object.keys(obj).forEach((key) => {
      // when field is array
      if (Array.isArray(obj[key])) {
        acc[key] = getCurrentValueArrayHandler(acc[key], [...obj[key]]);
        // when field is object never used
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        acc[key] = { ...acc[key] || {}, ...obj[key] }; // Copy the object using spread operator
        // when field is primitive
      } else {
        acc[key] = obj[key];
      }
    });
    return acc;
  }, {});
  return result;
}

export function getObjectType(entry) {
  const { priceCategories, dates, ...remaining } = entry;

  if (priceCategories) {
    return 'priceCategories';
  }

  if (dates) {
    return 'dates';
  }

  const meaningfulKeys = Object.keys(remaining).filter(
    (k) => !['appliedAt', 'response', 'operation'].includes(k),
  );

  if (meaningfulKeys.length) {
    return 'eventOffer';
  }

  // If there are no meaningful keys but we have metadata (appliedAt, response, operation),
  // it's still considered an eventOffer entry
  if (
    remaining.appliedAt !== undefined
    || remaining.response !== undefined
    || remaining.operation !== undefined
  ) {
    return 'eventOffer';
  }

  return null;
}
