export default (labels, field, error) => {
  const { code, message } = error;

  const matchingLabel = labels[code];

  if (!matchingLabel) return message;

  return Object.keys(field)
    .filter((fieldKey) => ['min', 'max', 'maxSize'].includes(fieldKey))
    .reduce((rendered, fieldKey) => {
      if (fieldKey === 'maxSize') {
        return rendered.replace(
          '%maxSize%',
          typeof field[fieldKey] === 'number'
            ? parseFloat((field[fieldKey] / 1024 / 1024).toFixed(2))
            : field[fieldKey],
        );
      }
      return rendered.replace(`%${fieldKey}%`, field[fieldKey]);
    }, matchingLabel);
};
