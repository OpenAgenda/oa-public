import { produce } from 'immer';

import {
  omit,
  findTimingLabel,
} from '@openagenda/registrations/passCulture/iso/utils';

export * from '@openagenda/registrations/passCulture/iso/utils';

export const logoPath = 'https://oasvc.s3.eu-west-1.amazonaws.com/registration-apps/pass-culture-240.png';

export function isConfigured(data) {
  return !!Object.keys(omit(data, ['checked'])).length;
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
