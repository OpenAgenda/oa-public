import text from './text';
import cleanParams from './lib/params';
import formatErrors from './lib/errors';

const validateLangCode = text({ max: 2, min: 2, rejectEmojis: true });

const DEFAULT_LANGUAGE = 'en';

const isStringOrArrayOf = (v) => {
  if (typeof v === 'string') {
    return true;
  }
  if (Array.isArray(v) && typeof v?.[0] === 'string') {
    return true;
  }
  return false;
}

export default (config = {}) => {
  const params = cleanParams('multilingual', config, {
    field: false,
    defaultLanguage: null,
    forceCodesToLowerCase: true,
    languages: [],
  });

  return Object.assign((origin) => {
    const clean = {};
    const errors = [];
    const value = {};

    // if is provided with string, validator distributes value
    // to all languages
    if (isStringOrArrayOf(origin) && params.languages.length) {
      Object.assign(value, params.languages.reduce((c, l) => ({
        ...c,
        [l]: origin,
      }), {}));
    } else if (isStringOrArrayOf(origin)) {
      Object.assign(value, {
        [params.defaultLanguage || DEFAULT_LANGUAGE]: origin,
      });
    } else {
      Object.assign(value, origin || {});
    }

    // if languages have been pre-specified, they should be
    // part of validation and sanitizing
    if (Array.isArray(params.languages)) {
      params.languages.forEach((l) => {
        value[l] = value[l] === undefined ? '' : value[l];
      });
    }

    if (!params.optional && !Object.keys(value).length) {
      throw formatErrors(
        params,
        undefined,
        'required',
        'at least one language entry is required',
      );
    }

    if (!Object.keys(value).length && (params.default !== undefined)) {
      return params.default;
    }

    Object.keys(value).forEach((l) => {
      try {
        validateLangCode(l);
      } catch (langCodeErrors) {
        langCodeErrors.forEach(e => errors.push({
          ...e,
          code: 'lang.invalid',
          message: 'lang code should be 2 [a-z] characters',
          ...params.field ? { field: params.field } : undefined,
        }));
        return;
      }
      
      const langValue = value[l];
      if (params.optional && (langValue === undefined || langValue === null)) {
        return;
      }

      try {
        const defaultValue = typeof params.default === 'string' ? params.default : (params?.default || {})[l];

        const validateText = text({
          ...params,
          default: defaultValue || null,
        });

        clean[params.forceCodesToLowerCase ? l.toLowerCase() : l] = validateText(langValue);
      } catch (lErrors) {
        lErrors.forEach((e) => {
          errors.push({ ...e, lang: l });
        });
      }
    });

    if (errors.length) {
      throw errors;
    }

    return clean;
  }, {
    type: 'multilingual',
    field: params.field,
  });
};
