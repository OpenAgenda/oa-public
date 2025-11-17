// move too validators ?
export default function validFieldValidator(config = {}) {
  const optional = config.optional !== undefined ? config.optional : true;
  const allowNull = config.allowNull !== undefined ? config.allowNull : true;

  const validator = (value) => {
    // Handle undefined - don't return anything to keep it out of the result
    if (value === undefined) {
      if (!optional) {
        throw new Error('valid field is required');
      }
      return undefined;
    }

    // Handle null
    if (value === null) {
      if (!allowNull) {
        throw new Error('valid field cannot be null');
      }
      return null;
    }

    // Handle arrays
    if (Array.isArray(value)) {
      // Validate each element is a boolean
      const invalidValues = value.filter((v) => v !== true && v !== false);
      if (invalidValues.length > 0) {
        throw new Error(
          `valid field array contains non-boolean values: ${JSON.stringify(invalidValues)}`,
        );
      }
      return value;
    }

    // Handle single boolean values
    if (value === true || value === false) {
      return value;
    }

    throw new Error(
      `valid field must be true, false, null, or an array of booleans. Received: ${JSON.stringify(value)}`,
    );
  };

  return Object.assign(validator, {
    type: 'validField',
    field: config.field,
  });
}
