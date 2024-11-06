import eventValidators from '../validators/index.js';

export default (schema) => {
  if (!schema.custom) {
    schema.custom = {};
  }

  Object.assign(schema.custom, eventValidators);
};
