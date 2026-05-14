import countriesByCode from '@openagenda/labels/agenda-locations/countries.js';

const validCodes = new Set(Object.keys(countriesByCode));

export default (config = {}) => {
  const { field, optional = true } = config;

  const validate = (value) => {
    if (value === undefined || value === null || value === '') {
      if (optional) return undefined;
      const error = [
        {
          origin: value,
          field,
          code: 'required',
          message: 'a country code is required',
        },
      ];
      throw error;
    }

    if (typeof value !== 'string') {
      const error = [
        {
          origin: value,
          field,
          code: 'countryCode.invalidType',
          message: 'country code must be a string',
        },
      ];
      throw error;
    }

    const clean = value.trim().toUpperCase();

    if (!validCodes.has(clean)) {
      const error = [
        {
          origin: value,
          field,
          code: 'countryCode.invalid',
          message: 'unknown ISO 3166-1 alpha-2 country code',
        },
      ];
      throw error;
    }

    return clean;
  };

  validate.type = 'countryCode';
  validate.field = field;

  return validate;
};
