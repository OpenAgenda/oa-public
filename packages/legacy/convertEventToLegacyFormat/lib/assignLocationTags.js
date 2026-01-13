export default function assignLocationTags(location, locationTagLang) {
  if (!location?.tags) {
    return {};
  }

  return {
    tags: location.tags.map(({ id, label }) => ({
      id,
      label:
        !label || typeof label === 'string' || !locationTagLang
          ? label
          : label[locationTagLang] ?? label[Object.keys(label)[0]],
    })),
  };
}
