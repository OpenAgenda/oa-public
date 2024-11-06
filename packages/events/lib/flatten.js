import unfilteredFields from './fields.js';

const fields = unfilteredFields.filter((f) => !!f.languages);

export default (item, lang, { html, useFallbackLang }) =>
  (html ? [{ field: 'html', default: '' }] : [])
    .concat(fields)
    .reduce((accu, field) => {
      if (accu[field.field]?.[lang]) {
        accu[field.field] = accu[field.field]?.[lang];
      } else if (useFallbackLang) {
        const fallbackLangs = Object.keys(accu[field.field]).filter(
          (l) => !!(accu[field.field]?.[l] || '').length,
        );

        accu[field.field] = fallbackLangs.length
          ? accu[field.field][fallbackLangs[0]]
          : field.default;
      } else {
        accu[field.field] = field.default;
      }

      return accu;
    }, item);
