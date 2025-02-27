import VError from '@openagenda/verror';
import addAdditionalFieldsOptionedValues from './addAdditionalFieldOptionedValues.js';

export default async function addAdditionalFields(doc, cursor, options = {}) {
  const {
    content,
    agenda,
    width: availableWidth,
    height,
    margin = 0,
    footerHeight,
    lang,
    simulate,
  } = options;

  const localCursor = { ...cursor };

  const availableHeight = height - margin - footerHeight;

  const fields = Object.values(agenda.schema.fields);
  const eventFieldsWithValues = fields
    .filter((field) => field.schemaType !== 'event')
    .filter((field) => field.field in content.event)
    .filter(
      (field) =>
        !content.remainingFields
        || content.remainingFields.find((f) => f.field === field.field),
    )
    .filter((field) => !!field.options) // non-optionned types are not handled for the time being
    .map((field) => ({
      field,
      values: [].concat(content.event[field.field] ?? []),
    }))
    .filter(({ values }) => values.length)
    .map((fieldValues, index) => ({ ...fieldValues, index }));

  let blockHeight = 0;
  let blockWidth = 0;

  for (const { field, values, index } of eventFieldsWithValues) {
    try {
      const { height: simulatedHeight } = await addAdditionalFieldsOptionedValues(doc, localCursor, {
        field,
        values,
        lang,
        availableWidth,
        simulate: true,
      });

      if (localCursor.y + blockHeight + simulatedHeight > availableHeight) {
        return {
          remainingFields: eventFieldsWithValues
            .slice(index)
            .map(({ field: remainingField }) => remainingField),
          width: blockWidth,
          height: blockHeight,
        };
      }

      const fieldValuesBlock = await addAdditionalFieldsOptionedValues(
        doc,
        localCursor,
        {
          field,
          values,
          lang,
          availableWidth,
          simulate,
        },
      );

      blockWidth += fieldValuesBlock.width;
      blockHeight += fieldValuesBlock.height + margin / 6;

      localCursor.y = cursor.y + blockHeight;
    } catch (error) {
      throw new VError(
        { info: { error, field } },
        'Failed to add additional field',
      );
    }
  }

  return {
    remainingFields: [],
    width: blockWidth,
    height: blockHeight,
  };
}
