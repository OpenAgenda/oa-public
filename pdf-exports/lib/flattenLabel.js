export default function flattenLabel(label, options = {}) {
  const { lang } = options;

  if (typeof label === 'string') {
    return label;
  }
  return label[lang];
}
