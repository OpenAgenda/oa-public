const typeLabels = require('@openagenda/labels/custom/types');
const types = Object.keys(require('./types'));
const validateField = require('./validateField');
const FormSchema = require('./FormSchema');

function getTypeLabels(type = false) {
  return types
    .filter((t) => type === false || t === type)
    .map((t) => ({
      type: t,
      label: typeLabels[t],
    }));
}

module.exports = {
  getTypeLabels,
  validateField,
  FormSchema,
};
