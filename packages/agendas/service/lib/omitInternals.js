import databaseFieldMap from '../databaseFieldMap.js';

const internalFields = databaseFieldMap
  .filter((field) => typeof field !== 'string' && field.internal)
  .map((f) => f.obj);

export default (agenda) =>
  Object.keys(agenda).reduce((stripped, field) => {
    if (internalFields.includes(field)) {
      return stripped;
    }
    return {
      ...stripped,
      [field]: agenda[field],
    };
  }, {});
