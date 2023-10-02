function extractLinks(value) {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === 'object') {
    return value?.links ?? [];
  }

  return [];
}

export function getNormalizedValue(value, settings) {
  const normalized = {
    links: extractLinks(value),
  };

  if (settings.passCulture) {
    normalized.passCulture = value?.passCulture;
  }

  return normalized;
}

export function updateValue(current, update, settings) {
  const updated = {
    ...getNormalizedValue(current, settings),
    ...update,
  };

  if (settings.passCulture) {
    return updated;
  }

  return updated.links;
}
