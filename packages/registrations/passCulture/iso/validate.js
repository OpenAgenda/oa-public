import { BadRequest } from '@openagenda/verror';

import {
  getTimingId,
  isFloatable,
} from './utils.js';

export function validateDate(value, params = {}) {
  const {
    priceCategories = [],
    timings = [],
    timezone = 'Europe/Paris',
    boolMode = false,
  } = params;

  if (!value || typeof value !== 'object') {
    if (boolMode) {
      return false;
    }
    throw new BadRequest({
      info: {
        errors: [{
          message: 'date must be a defined object',
          code: 'invalid.object',
          label: 'Une date ne peut pas être vide',
          field: 'dates',
        }],
      },
    });
  }

  const {
    timingId,
    priceCategoryIndex,
    quantity,
  } = value;

  const errors = [];
  const clean = {};

  if (!priceCategories[priceCategoryIndex]) {
    errors.push({
      message: 'date is not associated to a defined price category',
      code: 'invalid.priceCategoryIndex',
      label: 'La date n\'est pas associée à une catégorie de prix valide',
      field: 'dates',
    });
  } else {
    clean.priceCategoryIndex = priceCategoryIndex;
  }

  clean.quantity = parseInt(quantity, 10);

  if (Number.isNaN(clean.quantity) || clean.quantity < 0) {
    errors.push({
      message: 'quantity must be an integer superior or equal to 0',
      code: 'invalid.quantity',
      label: 'La quantité doit être un entier supérieur ou égal à 0',
      field: 'dates',
    });
  }

  if (!(timings ?? []).find(t => getTimingId(t, timezone) === timingId)) {
    errors.push({
      message: 'date must match a timing',
      code: 'invalid.timingId',
      label: 'La date ne correspond à aucun horaire',
      field: 'dates',
    });
  } else {
    clean.timingId = timingId;
  }

  if (errors.length && boolMode) {
    return false;
  }

  if (errors.length) {
    throw new BadRequest({ info: { errors } });
  }

  return boolMode ? true : clean;
}

export function validatePriceCategory(value, options = {}) {
  const {
    boolMode = false,
  } = options;

  const {
    price,
    label,
  } = value;

  const clean = {};

  const errors = [];

  if (!isFloatable(price ?? '') || Number.parseFloat(price) < 0) {
    errors.push({
      message: 'price should be a positive number',
      code: 'invalid.price',
    });
  } else {
    clean.price = Number.parseFloat(price);
  }

  if (typeof label !== 'string' || !label.length) {
    errors.push({
      message: 'label should be a non-empty string',
      code: 'invalid.string',
    });
  } else {
    clean.label = label;
  }

  if (errors.length && boolMode) {
    return false;
  }

  if (errors.length) {
    throw new BadRequest({ info: { errors } });
  }

  return boolMode ? true : clean;
}

export function validateLocalData(data, event, options = {}) {
  const fieldLabel = 'Pass Culture';

  const {
    boolMode = false,
    categories,
    related,
  } = options;

  const {
    timings,
  } = event;

  const errors = [];

  const {
    priceCategories = [],
    dates = [],
    venueId,
  } = data ?? {};

  const clean = {
    priceCategories: [],
    dates: [],
    venueId: null,
  };
  if (!data.category) {
    errors.push({
      message: 'category is required',
      code: 'registration.pass.requiredCategory',
      label: 'Une catégorie doit être définie',
      field: 'category',
    });
  }

  const matchingSettingsCategory = (categories ?? []).find(({ value }) => data.category === value);

  if (data.category && !matchingSettingsCategory) {
    errors.push({
      message: 'unknown category',
      code: 'registration.pass.unknownCategory',
      label: 'La catégorie spécifiée est inconnue',
      field: 'category',
    });
  }

  if (data.category && matchingSettingsCategory) {
    clean.category = data.category;
  }

  const subcategoryIsRequired = clean.category && !!matchingSettingsCategory.related.length;

  if (subcategoryIsRequired && !data.subcategory) {
    errors.push({
      message: 'subcategory is required',
      code: 'registration.pass.requiredSubcategory',
      label: 'Une sous-catégorie doit être définie',
      field: 'category',
    });
  }

  const matchingSettingsSubcategory = subcategoryIsRequired && related
    .find(({ schema }) => schema === matchingSettingsCategory.related[0])
    .options.find(({ value }) => value === data.subcategory);

  if (subcategoryIsRequired && !matchingSettingsSubcategory) {
    errors.push({
      message: 'invalid subcategory',
      code: 'registration.pass.invalidSubcategory',
      label: 'La sous-catégorie spécifiée est invalide',
      field: 'subcategory',
    });
  }

  if (matchingSettingsSubcategory) {
    clean.subcategory = matchingSettingsSubcategory.value;
  }

  clean.venueId = parseInt(venueId, 10);

  if (Number.isNaN(clean.venueId)) {
    errors.push({
      message: 'venueId is required and must be an integer',
      code: 'registration.pass.invalidVenueId',
      label: 'Un lieu valid doit être défini',
      field: 'venueId',
    });
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
        errors: errors.map(e => ({ ...e, fieldLabel })),
      },
    });
  }

  for (const [index, priceCategory] of priceCategories.entries()) {
    try {
      clean.priceCategories.push(validatePriceCategory(priceCategory));
    } catch (error) {
      error.info.errors.forEach(e => errors.push({ ...e, index }));
    }
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

  for (const [index, date] of [].concat(dates).entries()) {
    try {
      clean.dates.push(validateDate(date, {
        priceCategories: clean.priceCategories,
        timings,
      }));
    } catch (error) {
      error.info.errors.forEach(e => errors.push({
        ...e,
        index,
      }));
    }
  }

  if (errors.length && boolMode) {
    return false;
  }

  if (errors.length) {
    throw new BadRequest({
      info: {
        errors: errors.map(e => ({ ...e, fieldLabel })),
      },
    });
  }

  return clean;
}

export async function validateEventOffer({ pc, siren }, event, data = {}) {
  const {
    venueId,
  } = data;

  const { categories, related } = await pc.offers.events.categories.list();

  const clean = validateLocalData(data, event, { categories, related });

  const hasVenue = await pc.offers.offererVenues({ siren })
    .then(offererVenues => offererVenues.reduce((acc, { venues }) => [...acc, ...venues], []).find(v => v.id === venueId));
  if (!hasVenue) {
    throw new BadRequest(`offerer ${siren} has no venue with id ${venueId}`);
  }

  return clean;
}
