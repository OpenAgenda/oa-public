'use strict';

const DEFAULT_LANGUAGE = 'en';

const text = require('./text');
const cleanParams = require('./lib/params');

module.exports = (config = {})=> {
  const params = cleanParams('multilingual', config, {
    field: false,
    defaultLanguage: null,
    languages: []
  });

  return Object.assign(origin => {
    const clean = {};
    const errors = [];
    const value = {};

    // if is provided with string, validator distributes value
    // to all languages
    if ((typeof origin === 'string') && params.languages.length) {
      Object.assign(value, params.languages.reduce((c, l) => ({
        ...c,
        [l]: origin
      }), {}));
    } else if (typeof origin === 'string') {
      Object.assign(value, {
        [params.defaultLanguage || DEFAULT_LANGUAGE]: origin
      });
    } else {
      Object.assign(value, origin || {});
    }

    // if languages have been pre-specified, they should be
    // part of validation and sanitizing
    if (Array.isArray(params.languages)) {
      params.languages.forEach(l => {
        value[l] = value[l] === undefined ? '' : value[l];
      });
    }

    if (!params.optional && !Object.keys(value).length) {
      throw [{
        field: params.field,
        code: 'required',
        message: 'at least one language entry is required',
        origin
      }]
    }

    if (!Object.keys(value).length && (params.default !== undefined)) {
      return params.default;
    }

    Object.keys(value).forEach(l => {
      const langValue = value[l];
      if (params.optional && (langValue === undefined || langValue === null)) {
        return;
      }

      try {
        const defaultValue = typeof params.default === 'string' ? params.default : (params?.default || {})[l];

        const validateText = text({
          ...params,
          default: defaultValue || null
        });

        clean[l] = validateText(langValue);
      } catch(lErrors) {
        lErrors.forEach(e => {
          errors.push(({ ...e, lang: l}));
        });
      }
    });

    if (errors.length) {
      throw errors;
    }

    return clean;
  }, {
    type: 'multilingual',
    field: params.field
  });
}
