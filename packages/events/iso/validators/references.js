import integerValidator from '@openagenda/validators/integer';

export default ({ field }) => {
  const validateSingle = integerValidator(field);

  return (v) => {
    const clean = [];
    const errors = [];
    const arr = [].concat(v);
    for (const index in arr) {
      if (!Object.hasOwn(arr, index)) {
        continue;
      }

      try {
        clean.push(validateSingle(arr[index]));
      } catch (e) {
        if (!Array.isArray(e)) {
          throw e;
        } else {
          e.forEach((error) => errors.push({ ...error, index }));
        }
      }
    }

    if (errors.length) throw errors;

    return clean;
  };
};
