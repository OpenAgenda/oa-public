export default function boolQuery(value, options = {}) {
  const { defaultValue = false, nullable = false } = options;

  if (value === 'null' && nullable) {
    return null;
  }

  if (value === '1' || value === 'true') {
    return true;
  }
  if (value === '0' || value === 'false') {
    return false;
  }
  return defaultValue;
}
