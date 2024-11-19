import typeLabels from '@openagenda/labels/custom/types.js';
import validateField from './validateField.js';
import FormSchema from './FormSchema.js';
import types from './types.js';

const typeKeys = Object.keys(types);

function getTypeLabels(type = false) {
  return typeKeys
    .filter((t) => type === false || t === type)
    .map((t) => ({
      type: t,
      label: typeLabels[t],
    }));
}

export default {
  getTypeLabels,
  validateField,
  FormSchema,
};
