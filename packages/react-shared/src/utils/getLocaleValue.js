const DEFAULT_LANG = 'en';

const FALLBACK_MAP = {
  br: 'fr',
};

export default function getLocaleValue(
  labels,
  lang,
  defaultLang = DEFAULT_LANG,
  fallbackMap = FALLBACK_MAP
) {
  if (!labels || typeof labels !== 'object') {
    return labels;
  }

  const keys = Object.keys(labels);

  if (keys.find(v => v === lang)) {
    return labels[lang];
  }

  if (lang in fallbackMap) {
    return getLocaleValue(labels, fallbackMap[lang], defaultLang, fallbackMap);
  }

  if (defaultLang && keys.find(v => v === defaultLang)) {
    return labels[defaultLang];
  }

  return labels[keys[0]];
}
