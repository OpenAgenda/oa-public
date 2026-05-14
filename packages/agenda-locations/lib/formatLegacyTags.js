/**
 * filterLegacyTags - Filters location tags based on form schema validation
 *
 * This function validates location tags against the legacy tagSet configuration
 * defined in the form schema. Only tags that are present in the schema's
 * legacy.tagSet.groups configuration will be retained.
 *
 * @param {Object} location - The location object containing tags
 * @param {Object} schema - The form schema containing field definitions
 * @returns {Object} Location object with filtered tags
 */
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

export default filterLegacyTags;
