'use strict';

module.exports = (agendaUid, settings, legacySettings) => {
  if (!legacySettings.tagSet) {
    return legacySettings;
  }

  const optionByFields = settings.form.reduce((mapped, field) => {
    if (!field.options) {
      return mapped;
    }
    return mapped.concat(
      field.options.map(o => ({
        fieldName: field.field,
        optionId: o.id,
        schemaId: field.schemaId
      }))
    );
  }, []);

  const slugSchemaOptionIdMap = legacySettings.tagSet.groups.reduce(
    (map, group) => map.concat(
      group.tags.map(t => ({
        ...optionByFields
          .filter(
            o => t.schemaOptionId === [o.schemaId, o.optionId].join('.')
          )
          .pop(),
        slug: t.slug
      }))
    ),
    []
  );

  return {
    uid: agendaUid,
    ...legacySettings,
    slugSchemaOptionIdMap
  };
};
