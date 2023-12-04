import { BadRequest } from '@openagenda/verror';

import validateDate from './validateDate.js';
import validatePriceCategory from './validatePriceCategory.js';
import validateRelatedField from './validateRelatedField.js';
import validateEmail from './validateEmail.js';

export default function validateLocalData(data, event, options = {}) {
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
    bookingContact,
    bookingEmail,
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

  try {
    const {
      name: relatedFieldName,
      value: relatedFieldValue,
    } = validateRelatedField({ categories, related }, data);

    if (relatedFieldName) {
      clean[relatedFieldName] = relatedFieldValue;
    }
  } catch (error) {
    error.info.errors.forEach(e => errors.push(e));
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

  if (bookingContact) {
    try {
      clean.bookingContact = validateEmail(bookingContact, 'bookingContact');
    } catch (error) {
      error.info.errors.forEach(e => errors.push(e));
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

  if (data.description) {
    clean.description = data.description;
  }

  if (bookingEmail) {
    try {
      clean.bookingEmail = validateEmail(bookingEmail, 'bookingEmail');
    } catch (error) {
      error.info.errors.forEach(e => errors.push(e));
    }
  }

  return clean;
}
