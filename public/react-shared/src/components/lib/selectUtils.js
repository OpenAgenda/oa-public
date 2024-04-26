const extractNewValues = (current, value, separator) => {
  const spread = separator ? value
    .split(separator)
    .map(p => p.trim())
    .filter(p => p?.length) : value;

  return spread.filter(part => !current?.some(({ value }) => part === value));
}

export function hasNewValues(current, value, separator) {
  return !!extractNewValues(current, value, separator).length;
}

export function appendNewValues(current, value, separator) {
  const newValues = extractNewValues(current, value, separator);

  return (current ?? []).concat(newValues.map(v => ({ value: v, label: v })));
}