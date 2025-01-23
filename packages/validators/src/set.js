export default (validators, options = {}) => {
  const params = {
    compact: false,
    ...options,
  };

  return Object.assign(function validate(valuesSet) {
    let errors = []; const clean = []; const
      compacted = {};

    validators.forEach((validator) => {
      let matchingValue = valuesSet.filter((v) => v.field === validator.field);

      matchingValue = matchingValue.length ? matchingValue[0] : { field: validator.field, value: undefined };

      try {
        clean.push({
          field: matchingValue.field,
          value: validator(matchingValue.value),
        });
      } catch (e) {
        errors = errors.concat(e);
      }
    });

    if (errors.length) {
      throw errors;
    }

    if (params.compact) {
      clean.forEach((c) => {
        compacted[c.field] = c.value;
      });

      return compacted;
    }

    return clean;
  }, {
    type: 'set',
  });
};
