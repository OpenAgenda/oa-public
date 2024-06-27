import { BadRequest } from '@openagenda/verror';

import {
  getTimingId,
} from '../utils.js';

export default function validateDate(value, params = {}) {
  const {
    priceCategories = [],
    timings = [],
    timezone = 'Europe/Paris',
    boolMode = false,
    ignoreId = false,
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
    id,
    timingId,
    priceCategoryId,
    quantity,
    deleted,
  } = value;

  const errors = [];
  const clean = {};

  clean.id = parseInt(id, 10);

  if (!ignoreId && (Number.isNaN(clean.id) || clean.id < 1)) {
    errors.push({
      message: 'date must have a positive assigned id',
      code: 'invalid.id',
      label: 'Identifiant non assigné',
      field: 'dates',
    });
  }

  if (deleted && clean.id) {
    return {
      ...clean,
      deleted: true,
    };
  }

  if (!priceCategories.find(pc => pc.id === priceCategoryId)) {
    errors.push({
      message: 'date is not associated to a defined price category',
      code: 'invalid.priceCategoryId',
      label: 'La date n\'est pas associée à une catégorie de prix valide',
      field: 'dates',
    });
  } else {
    clean.priceCategoryId = priceCategoryId;
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

export function validateDates(dates, priceCategories, event) {
  const clean = [];
  const errors = [];
  const { timings } = event;

  for (const [index, date] of [].concat(dates).entries()) {
    try {
      clean.push(validateDate(date, {
        priceCategories,
        timings,
      }));
    } catch (error) {
      error.info.errors.forEach(e => errors.push({
        ...e,
        index,
      }));
    }
  }

  if (errors.length) {
    throw new BadRequest({ info: { errors } });
  }

  return clean;
}
