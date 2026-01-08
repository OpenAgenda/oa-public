import unfilteredFields from './fields.js';

const fields = unfilteredFields.filter((f) => !!f.languages);

export default (item, lang, { html, useFallbackLang }) =>
  (html ? [{ field: 'html', default: '' }] : [])
    .concat(fields)
    .reduce((accu, field) => {
      const value = [undefined, null].includes(accu[field.field])
        ? {}
        : accu[field.field];
      if (value?.[lang]) {
        accu[field.field] = accu[field.field]?.[lang];
      } else if (useFallbackLang) {
        const fallbackLangs = Object.keys(value).filter(
          (l) => !!(value?.[l] || '').length,
        );

        accu[field.field] = fallbackLangs.length
          ? value?.[fallbackLangs[0]]
          : field.default;
      } else {
        accu[field.field] = field.default;
      }

      return accu;
    }, item);
