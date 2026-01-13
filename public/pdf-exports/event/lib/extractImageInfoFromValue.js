export default function extractImageInfoFromValue(value, defaultImagePath) {
  if (!value) return { filename: undefined };

  if (typeof value !== 'string') {
    return {
      ...value,
      base: value?.base ?? defaultImagePath,
    };
  }

  const parts = value.split('/');
  const filename = parts.pop();
  const path = parts.join('/');

  return {
    filename,
    base: path.length ? `${path}/` : defaultImagePath,
  };
}
