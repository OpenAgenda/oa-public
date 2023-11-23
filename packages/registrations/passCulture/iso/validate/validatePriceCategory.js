import { BadRequest } from '@openagenda/verror';

import {
  isFloatable,
} from '../utils.js';

export default function validatePriceCategory(value, options = {}) {
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
