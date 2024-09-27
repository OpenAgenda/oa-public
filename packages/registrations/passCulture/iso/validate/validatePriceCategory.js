import { BadRequest } from '@openagenda/verror';

import { isFloatable } from '../utils.js';

export default function validatePriceCategory(value, options = {}) {
  const { boolMode = false } = options;

  const { price, label, id } = value;

  const clean = {};

  const errors = [];

  if (!isFloatable(price ?? '') || Number.parseFloat(price) < 0) {
    errors.push({
      message: 'price should be a positive number',
      code: 'invalid.price',
    });
  } else if (Number.parseFloat(price) > 3000) {
    errors.push({
      message: 'price should be lower than 30',
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
  clean.id = id;
  return boolMode ? true : clean;
}

export function validatePriceCategories(priceCategories) {
  const clean = [];
  const errors = [];
  for (const [index, priceCategory] of priceCategories.entries()) {
    try {
      clean.push(validatePriceCategory(priceCategory));
    } catch (pcError) {
      pcError.info.errors.forEach((error) => errors.push({ ...error, index }));
    }
  }

  if (errors.length) {
    throw new BadRequest({ info: { errors } });
  }

  return clean;
}
