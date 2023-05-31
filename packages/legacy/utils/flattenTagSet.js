'use strict';

module.exports = (tagSet, formSchema) => (tagSet?.groups ?? [])
  .reduce((carry, tagGroup) => carry.concat(tagGroup.tags.map(tag => {
    const [schemaId, tagId] = tag.schemaOptionId.split('.');

    const optionedSchemaFields = (formSchema.fields ?? formSchema).filter(field => field.options);

    const fieldSlug = optionedSchemaFields
      .find(
        field => field.options.find(option => tag.schemaOptionId === `${field.schemaId}.${option.id}`),
      )?.field;

    return {
      ...tag,
      schemaId: parseInt(schemaId, 10),
      optionId: parseInt(tagId, 10),
      field: tagGroup.name,
      fieldSlug,
    };
  })), []);
