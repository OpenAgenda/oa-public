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
