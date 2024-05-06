import { produce } from 'immer';
import _ from 'lodash';

import {
  omit,
  findTimingLabel,
} from '@openagenda/registrations/passCulture/iso/utils';

export * from '@openagenda/registrations/passCulture/iso/utils';

export const logoPath = 'https://oasvc.s3.eu-west-1.amazonaws.com/registration-apps/pass-culture-240.png';

export function getNextId(data) {
  return Object.keys(data).reduce((acc, curr) => {
    if (Array.isArray(data[curr])) {
      const maxId = data[curr].reduce((max, { id }) => (id > max ? id : max), -1);
      return maxId + 1 > acc ? maxId + 1 : acc;
    }

    return acc;
  }, 0);
}

const getCurrentValueArrayHandler = (initialAcc, objArr) => (initialAcc ? objArr.reduce((acc, item) => {
  const accIndex = acc.findIndex(({ id }) => id === item.id);

  if (accIndex === -1) {
    return acc.concat(item);
  }

  acc[accIndex] = { ...acc[accIndex], ...item };
  return acc;
}, initialAcc) : objArr);

export function getCurrentValue(data) {
  if (!Array.isArray(data) && !data?.response) {
    return data || {};
  }
  const dataWithResponse = produce([].concat(data), draft => draft.reduce((carry, patch) => carry.concat(_.omit(patch, 'response'), patch?.response ? patch.response : []), []));
  const result = dataWithResponse.reduce((acc, obj) => {
    Object.keys(obj).forEach(key => {
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

export function isConfigured(data) {
  return !!Object.keys(omit(data, ['checked'])).length;
}

export function addPriceCategory(value, nextId, { price, label }) {
  const centsPrice = price * 100;
  return produce(value, draft => {
    draft.priceCategories = (draft.priceCategories ?? []).concat({ price: centsPrice, label, id: nextId });
  });
}

export function removePriceCategory(value, { id }) {
  return produce(value, draft => {
    draft.priceCategories = draft.priceCategories.filter(pc => pc.id !== id);

    draft.dates = (draft.dates ?? []).filter(({ priceCategoryId }) => priceCategoryId !== id);
  });
}

export function changePriceCategory(value, { price, label, id, passId }) {
  const centsPrice = price * 100;
  return produce(value, draft => {
    if (!draft.priceCategories) {
      draft.priceCategories = passId ? [{ price: centsPrice, label, id, passId }] : [{ price: centsPrice, label, id }];
    }
    draft.priceCategories.reduce((acc, current) => {
      if (current.id === id) {
        current.price = centsPrice;
        current.label = label;
        if (passId) current.passId = passId;
      }
      return acc.concat(current);
    }, []);
  });
}

export function changeDate(value, { timingId, priceCategoryId, quantity, id, passId }) {
  return produce(value, draft => {
    if (!draft.dates) {
      draft.dates = passId ? [{ timingId, priceCategoryId, quantity, id, passId }] : [{ timingId, priceCategoryId, quantity, id }];
    }
    draft.dates.reduce((acc, current) => {
      if (current.id === id) {
        current.timingId = timingId;
        current.priceCategoryId = priceCategoryId;
        current.quantity = quantity;
        current.id = id;
        if (passId) current.passId = passId;
      }
      return acc.concat(current);
    }, []);
  });
}

export function removeDate(value, { id, passId }) {
  return produce(value, draft => {
    if (!passId) draft.dates = draft.dates.filter(d => d.id !== id);
    if (passId) {
      draft.dates.reduce((acc, current) => {
        if (current.id === id) {
          current.deleted = true;
        }
        return acc.concat(current);
      }, []);
    }
  });
}

export function decorateDates(dates = [], timings = []) {
  return dates.map(date => {
    const timingLabel = findTimingLabel(timings, date.timingId, { throwNotFound: false });

    return {
      timingLabel,
      hasMatchingTiming: timingLabel,
      ...date,
    };
  });
}
