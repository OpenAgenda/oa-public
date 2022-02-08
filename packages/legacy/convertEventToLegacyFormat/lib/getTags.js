'use strict';

const flattenTagSet = require('../../utils/flattenTagSet');

module.exports = (agendaSettings, event) => {
  const { formSchema } = agendaSettings;
  const { tagSet } = agendaSettings.legacy;

  const tagFields = formSchema.fields.filter(f => Object.keys(event).find(el => f.field === el) && f.origin === 'tags');

  const tagsList = flattenTagSet(tagSet, tagFields);

  const filteredTags = tagsList.filter(t => tagFields.find(field => {
    if (Array.isArray(event[field.field])) {
      return parseInt(field.schemaId, 10) === t.schemaId && event[field.field].includes(t.optionId);
    }
    return parseInt(field.schemaId, 10) === t.schemaId && parseInt(event[field.field], 10) === t.optionId;
  }));

  const tagGroups = tagSet && Object.keys(tagSet).length
    ? tagSet.groups.reduce((carry, tagGroup) => {
      const tag = filteredTags.filter(filteredTag => filteredTag.field === tagGroup.name).map(filteredTag => ({
        label: filteredTag.label,
        slug: filteredTag.slug,
        id: filteredTag.id,
        schemaOptionId: filteredTag.schemaOptionId
      }));

      const item = {
        name: tagGroup.name,
        access: tagGroup.access,
        slug: filteredTags.filter(filteredTag => filteredTag.field === tagGroup.name).reduce((acc, filteredTag) => filteredTag.fieldSlug, ''),
        tags: tag
      };

      if (item.tags.length) {
        carry.push(item);
      }

      return carry;
    }, [])
    : [];

  const tags = tagGroups.length ? tagGroups.reduce((carry, tagGroup) => carry.concat(tagGroup.tags), []) : [];
  return { tagGroups, tags };
};
