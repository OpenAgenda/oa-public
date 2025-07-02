import { BadRequest } from '@openagenda/verror';
import { validateDates } from './validateDate.js';
import { validatePriceCategories } from './validatePriceCategory.js';
import validateEventOffer from './validateEventOffer.js';

const fieldLabel = 'Pass Culture';

export default function validateMergedLocalData(data, event, options = {}) {
  const { boolMode = false } = options;

  const errors = [];

  const { priceCategories = [], dates = [] } = data ?? {};

  const clean = {
    priceCategories: [],
    dates: [],
    venueId: null,
  };

  try {
    Object.assign(clean, validateEventOffer(data, options));
  } catch (error) {
    error.info.errors.forEach((e) => errors.push(e));
  }

  if (boolMode && errors.length) {
    return false;
  }

  if (!priceCategories?.length) {
    if (boolMode) {
      return false;
    }
    errors.push({
      message: 'at least one price category must be defined',
      code: 'registration.pass.requiredPriceCategories',
      label: 'Au moins une catégorie de prix doit être définie',
      field: 'priceCategories',
    });

    throw new BadRequest({
      info: {
        errors: errors.map((e) => ({ ...e, fieldLabel })),
      },
    });
  }

  try {
    clean.priceCategories = validatePriceCategories(priceCategories);
  } catch (error) {
    error.info.errors.forEach((e) => errors.push(e));
  }

  if (errors.length && boolMode) {
    return false;
  }

  const noDates = !Array.isArray(dates) || !dates.length;

  if (noDates && boolMode) {
    return false;
  }

  if (noDates) {
    errors.push({
      message: 'at least one date should be defined',
      code: 'registration.pass.requiredDates',
      label: 'Au moins une date doit être définie',
      field: 'dates',
    });
  }

  try {
    clean.dates = validateDates(dates, clean.priceCategories, event);
  } catch (error) {
    error.info.errors.forEach((e) => errors.push(e));
  }

  if (errors.length && boolMode) {
    return false;
  }

  if (errors.length) {
    throw new BadRequest({
      info: {
        errors: errors.map((e) => ({ ...e, fieldLabel })),
      },
    });
  }

  return clean;
}
