function stripTimestamp(filename) {
  const idx = filename.indexOf('?');
  return idx !== -1 ? filename.slice(0, idx) : filename;
}

export default function filterImageTimestamps(event) {
  if (!event?.image?.filename) {
    return event;
  }

  const cleanFilename = stripTimestamp(event.image.filename);

  const variants = event.image.variants
    ? event.image.variants.map((v) => {
      const clean = stripTimestamp(v.filename);
      return clean !== v.filename ? { ...v, filename: clean } : v;
    })
    : event.image.variants;

  if (
    cleanFilename === event.image.filename
    && variants === event.image.variants
  ) {
    return event;
  }

  return {
    ...event,
    image: {
      ...event.image,
      filename: cleanFilename,
      ...variants !== undefined ? { variants } : {},
    },
  };
}
