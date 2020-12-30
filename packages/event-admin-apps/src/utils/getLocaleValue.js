export default function getLocaleValue(labels, lang, defaultLang) {
  if (!labels || typeof labels !== 'object') {
    return labels;
  }

  const keys = Object.keys(labels);

  if (keys.find(v => v === lang)) {
    return labels[lang];
  }

  if (defaultLang && keys.find(v => v === defaultLang)) {
    return labels[defaultLang];
  }

  return labels[keys[0]];
}
