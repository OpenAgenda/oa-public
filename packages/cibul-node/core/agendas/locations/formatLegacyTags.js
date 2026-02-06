const filterLegacyTags = (location, schema) => {
  if (!location?.tags || !schema?.fields) {
    return location;
  }

  const locationField = schema.fields.find(
    (field) => field.field === 'location',
  );
  if (!locationField?.legacy?.tagSet?.groups) {
    return location;
  }

  const validTagIds = locationField.legacy.tagSet.groups.reduce(
    (acc, group) => {
      if (group.tags) {
        group.tags.forEach((tag) => {
          if (tag.id) {
            acc.push(tag.id.toString());
          }
        });
      }
      return acc;
    },
    [],
  );

  if (validTagIds.length === 0) {
    return location;
  }

  const filteredLegacyTags = location.tags.filter(
    (tag) => tag && validTagIds.includes(tag.id?.toString()),
  );

  return {
    ...location,
    tags: filteredLegacyTags,
  };
};

export default {
  filterLegacyTags,
};
