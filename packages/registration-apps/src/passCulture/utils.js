import { produce } from 'immer';

import {
  omit,
  findTimingLabel,
} from '@openagenda/registrations/passCulture/iso/utils';

export * from '@openagenda/registrations/passCulture/iso/utils';

export const logoPath = 'https://cdn.openagenda.com/svc/registration-apps/pass-culture-240.png';
export const rejectedLogoPath = 'https://cdn.openagenda.com/svc/registration-apps/pass-culture-rejected-240.png';
export const errorLogoPath = 'https://cdn.openagenda.com/svc/registration-apps/pass-culture-error-240.png';
export const pendingLogoPath = 'https://cdn.openagenda.com/svc/registration-apps/pass-culture-pending-240.png';

export function getNextId(data) {
  return Object.keys(data).reduce((acc, curr) => {
    if (Array.isArray(data[curr])) {
      const maxId = data[curr].reduce(
        (max, { id }) => (id > max ? id : max),
        -1,
      );
      return maxId + 1 > acc ? maxId + 1 : acc;
    }

    return acc;
  }, 0);
}

export function isConfigured(data) {
  return !!Object.keys(omit(data, ['checked'])).length;
}

export function addPriceCategory(value, nextId, { price, label }) {
  const centsPrice = price * 100;
  return produce(value, (draft) => {
    draft.priceCategories = (draft.priceCategories ?? []).concat({
      price: centsPrice,
      label,
      id: nextId,
    });
  });
}

export function removePriceCategory(value, { id }) {
  return produce(value, (draft) => {
    draft.priceCategories = draft.priceCategories.filter((pc) => pc.id !== id);

    draft.dates = (draft.dates ?? []).filter(
      ({ priceCategoryId }) => priceCategoryId !== id,
    );
  });
}

export function changePriceCategory(value, { price, label, id, passId }) {
  const centsPrice = price * 100;
  return produce(value, (draft) => {
    if (!draft.priceCategories) {
      draft.priceCategories = passId
        ? [{ price: centsPrice, label, id, passId }]
        : [{ price: centsPrice, label, id }];
    }
    draft.priceCategories.reduce((acc, current) => {
      if (current.id === id) {
        current.price = centsPrice;
        current.label = label;
        if (passId) current.passId = passId;
      }
      return acc.concat(current);
    }, []);
    if (passId && !draft.priceCategories.find((pc) => pc.passId === passId)) {
      draft.priceCategories = (draft.priceCategories || []).concat({
        price: centsPrice,
        label,
        id,
        passId,
      });
    }
  });
}

export function changeDate(
  value,
  { timingId, priceCategoryId, quantity, id, passId },
) {
  return produce(value, (draft) => {
    if (!draft.dates) {
      draft.dates = passId
        ? [{ timingId, priceCategoryId, quantity, id, passId }]
        : [{ timingId, priceCategoryId, quantity, id }];
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
    if (passId && !draft.dates.find((d) => d.passId === passId)) {
      draft.dates = (draft.dates || []).concat({
        timingId,
        priceCategoryId,
        quantity,
        id,
        passId,
      });
    }
  });
}

export function removeDate(value, { id, passId }, currentValue) {
  return produce(value, (draft) => {
    if (!passId) draft.dates = draft.dates.filter((d) => d.id !== id);
    if (passId) {
      draft.dates = (
        draft.dates ? draft.dates.filter((d) => d.passId !== passId) : []
      ).concat({
        ...currentValue.dates.find((d) => d.passId === passId),
        deleted: true,
      });
    }
  });
}

export function decorateDates(dates = [], timings = []) {
  return dates.map((date) => {
    const timingLabel = findTimingLabel(timings, date.timingId, {
      throwNotFound: false,
    });

    return {
      timingLabel,
      hasMatchingTiming: timingLabel,
      ...date,
    };
  });
}

export function isPatchMode(data) {
  if (!Array.isArray(data) || !data.length) {
    return false;
  }
  if (data[0].appliedAt) {
    return true;
  }
  return false;
}
