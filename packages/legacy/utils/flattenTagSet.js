'use strict';

module.exports = (tagSet, formSchema) => (tagSet?.groups ?? []).reduce((carry, tagGroup) => (carry.concat(tagGroup.tags.map(tag => {
  const [schemaId, tagId] = tag.schemaOptionId.split('.');

  const fieldSlug = (formSchema.fields || formSchema).find(field => {
    if (field.options) {
      return field.options.find(option => parseInt(option.id, 10) === parseInt(tagId, 10));
    }
    return false;
  })?.field;

  return {
    ...tag,
    schemaId: parseInt(schemaId, 10),
    optionId: parseInt(tagId, 10),
    field: tagGroup.name,
    fieldSlug
  };
}))), []);
