'use strict';

const flattenTagSet = require('../../utils/flattenTagSet');

module.exports = (agendaSettings, event) => {
  const { formSchema, legacy: { tagSet }, admin } = agendaSettings;
  const tagFields = formSchema.fields.filter(f => Object.keys(event).find(el => f.field === el && (f.origin === 'tags' || f.origin === null)));

  const tagsList = flattenTagSet(tagSet, tagFields);

  const filteredTags = tagsList.filter(tag => {
    if (Array.isArray(event[tag.fieldSlug])) return event[tag.fieldSlug] && event[tag.fieldSlug].includes(tag.optionId);
    return event[tag.fieldSlug] && tag.optionId === event[tag.fieldSlug];
  });

  const tagGroups = tagSet && tagSet.groups
    ? tagSet.groups
      .filter(g => (g.access === 'administrator' ? admin : true))
      .reduce((carry, tagGroup) => {
        const tag = filteredTags.filter(filteredTag => filteredTag.field === tagGroup.name).map(filteredTag => ({
          label: filteredTag.label,
          slug: filteredTag.slug,
          id: filteredTag.id,
          schemaOptionId: filteredTag.schemaOptionId,
        }));

        if (tag.length) {
          const item = {
            name: tagGroup.name,
            access: tagGroup.access,
            slug: filteredTags.find(filteredTag => filteredTag.field === tagGroup.name)?.fieldSlug,
            tags: tag,
          };
          carry.push(item);
        }

        return carry;
      }, [])
    : [];

  const tags = tagGroups.length ? tagGroups.reduce((carry, tagGroup) => carry.concat(tagGroup.tags), []) : [];
  return { tagGroups, tags };
};
