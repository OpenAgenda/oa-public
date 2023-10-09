import isFloat from 'validator/lib/isFloat';
import { format } from 'date-fns';

import { produce } from 'immer';

const omit = (obj, fields = []) => Object.keys(obj).reduce(
  (filtered, key) => (fields.includes(key) ? filtered : Object.assign(filtered, { [key]: obj[key] })),
  {},
);

export function isConfigured(data) {
  return !!Object.keys(omit(data, ['checked'])).length;
}

export function loadData({ res }) {
  return fetch(res.categories).then(r => {
    if (r.ok) {
      return r.json();
    }

    throw new Error('Failed to fetch pass categories');
  });
}

export function isPriceCategoryValid(value = {}) {
  const {
    price,
    label,
  } = value;

  return isFloat(price ?? '')
    && parseFloat(price) >= 0
    && (
      typeof label === 'string' && label.length
    );
}

export function isDateValid() {
  return true;
}

export function isValid(v) {
  if (!v.priceCategories?.length) {
    return false;
  }
  for (const pc of v.priceCategories ?? []) {
    if (!isPriceCategoryValid(pc)) {
      return false;
    }
  }

  if (!v.dates?.length) {
    return false;
  }

  for (const date of v.dates ?? []) {
    if (!isDateValid(date)) {
      return false;
    }
  }

  return true;
}

export function addPriceCategory(value, { price, label }) {
  return produce(value, draft => {
    draft.priceCategories = (draft.priceCategories ?? []).concat({ price, label });
  });
}

export function removePriceCategory(value, { price, label }) {
  return produce(value, draft => {
    const matchingIndex = draft.priceCategories.findIndex(pc => pc.price === price && pc.label === label);

    draft.priceCategories = draft.priceCategories.filter((pc, index) => index !== matchingIndex);

    draft.dates = (draft.dates ?? []).filter(({ priceCategoryIndex }) => priceCategoryIndex !== matchingIndex);
  });
}

export function changePriceCategory(value, index, { price, label }) {
  return produce(value, draft => {
    draft.priceCategories[index] = { price, label };
  });
}

export function getTimingLabel(timing) {
  return format(new Date(timing.begin), 'yyyy-MM-dd HH:mm');
}

export function findTimingLabel(timings, timingId) {
  const timing = timings.find(t => new Date(t.begin).getTime() === timingId);

  if (!timing) {
    throw new Error(`Could not find timing matching ${timingId}`);
  }

  return getTimingLabel(timing);
}

export function changeDate(value, index, { timingId, priceCategoryIndex, quantity }) {
  return produce(value, draft => {
    draft.dates[index] = {
      timingId,
      priceCategoryIndex,
      quantity,
    };
  });
}

export function removeDate(value, { timingId, priceCategoryIndex }) {
  return produce(value, draft => {
    const matchingIndex = draft.dates.findIndex(d => d.timingId === timingId && d.priceCategoryIndex === priceCategoryIndex);

    draft.dates = draft.dates.filter((d, index) => index !== matchingIndex);
  });
}
