export default function getMultiLanguageLabel(entry, lang) {
  if (typeof entry !== 'object') {
    return entry;
  }

  const keys = Object.keys(entry);
  return entry[lang] || entry[keys[0]];
}
