const defaultOptions = {
  internal: false,
  protected: true,
  detailed: false,
};

function filterFields(fieldsMap, type, options) {
  const params = {
    ...defaultOptions,
    ...options,
  };

  return fieldsMap.filter(field => {
    if (['insert', 'update'].includes(type)) {
      if (field.protected && params.protected) {
        return false;
      }
    } else if (['select'].includes(type)) {
      if (field.internal && !params.internal) {
        return false;
      }
      if (field.detailed && !params.detailed) {
        return false;
      }
    }

    return true;
  });
}

export function toObj(fieldsMap, data, options) {
  if (!data) {
    return data;
  }

  return filterFields(fieldsMap, 'select', options).reduce((result, field) => {
    const value = data[field.db];

    if (value === undefined) {
      return result;
    }

    result[field.obj] = field.json ? JSON.parse(value) : value;

    return result;
  }, {});
}

export function toDb(fieldsMap, type, data, options) {
  return filterFields(fieldsMap, type, options).reduce((result, field) => {
    const value = data[field.obj];

    if (value === undefined) {
      return result;
    }

    result[field.db] = field.json ? JSON.stringify(value) : value;

    return result;
  }, {});
}

export function listFields(
  fieldsMap,
  type,
  from,
  options,
  aliased = false,
  outputPrefix = ''
) {
  return filterFields(fieldsMap, type, options).map(field => {
    const alias = aliased ? ` as ${outputPrefix}${field.obj}` : '';
    return field[from] + alias;
  });
}

export default {
  toObj,
  toDb,
  listFields,
};
