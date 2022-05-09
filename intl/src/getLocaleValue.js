import { DEFAULT_LANG, DEFAULT_FALLBACK_MAP } from './constants';

export default function getLocaleValue(
  labels,
  lang,
  defaultLang = DEFAULT_LANG,
  fallbackMap = DEFAULT_FALLBACK_MAP
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
