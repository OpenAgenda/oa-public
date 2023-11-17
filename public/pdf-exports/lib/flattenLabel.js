export default function flattenLabel(label, lang) {
  if (typeof label === 'string') {
    return label;
  }
  return label[lang];
}
