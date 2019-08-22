'use strict';

module.exports = function makeLabelGetter(labels, defaultLang) {
  return (name, values, lang) => {
    let locale = lang;
    let data = values;

    if (locale === undefined && typeof data === 'string') {
      locale = data;
      data = {};
    }

    if (!locale) {
      locale = defaultLang;
    }

    let label = labels[name] && labels[name][locale] ? labels[name][locale] : name;

    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        label = label.replace(new RegExp(`%${key}%`, 'g'), data[key]);
      }
    }

    return label;
  };
};
