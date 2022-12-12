const _ = require('lodash');

const labelFields = ['label', 'info', 'sub', 'help', 'placeholder'];

const isMultilingual = (field, labelKey) => _.isObject(field[labelKey]);

module.exports = function areFieldLabelsMultilingual(field) {
  const definedLabelFields = labelFields.filter(f => _.get(field, f));

  if (definedLabelFields.filter(f => !isMultilingual(field, f)).length !== definedLabelFields.length) {
    return true;
  }

  if (field.options) {
    const multilingualOptions = field.options.filter(o => areFieldLabelsMultilingual(o));
    return !!multilingualOptions.length;
  }

  return false;
};
