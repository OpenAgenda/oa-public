'use strict';

module.exports = (labels, field, error) => {
  const { code, message } = error;

  const matchingLabel = labels[code];

  if (!matchingLabel) return message;

  return Object.keys(field)
    .filter(fieldKey => ['min', 'max'].includes(fieldKey))
    .reduce((rendered, fieldKey) => rendered.replace(
      '%' + fieldKey + '%',
      field[fieldKey]
    ), matchingLabel);
}
