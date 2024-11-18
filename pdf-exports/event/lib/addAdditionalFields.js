import { getLocaleValue } from '@openagenda/intl';
import addText from './addText.js';

export default async function addAdditionalFields(doc, cursor, options = {}) {
  const { content, agenda, width, height, margin, footerHeight, lang, simulate } = options;
  const currentCursor = { ...cursor };

  const availableHeight = height - margin - footerHeight;

  const fields = Object.values(agenda.schema.fields);
  const eventFields = fields
    .filter(field => field.schemaType !== 'event')
    .filter(field => field.field in content.event)
    .filter(field => !content.remainingFields || content.remainingFields.find(f => f.field === field.field));

  let remainingFields = eventFields;
  let index = 0;
  let accumulatedHeight = 0;
  let maxWidth = 0;

  while (index < remainingFields.length) {
    const field = remainingFields[index];
    const eventAdditionalField = content.event[field.field];
    if (eventAdditionalField) {
      const simulateFieldTitle = await addText(doc, cursor, {
        content: getLocaleValue(field.label, lang),
        width,
        bold: true,
        lang,
        simulate: true,
      });

      accumulatedHeight += simulateFieldTitle.height;
      maxWidth = Math.max(maxWidth, simulateFieldTitle.width);

      for (const fieldValueId of eventAdditionalField) {
        const option = field.options.find(opt => opt.id === fieldValueId);

        const simulateFieldValue = await addText(doc, cursor, {
          content: getLocaleValue(option.label, lang),
          width,
          lang,
          simulate: true,
        });

        accumulatedHeight += simulateFieldValue.height;
        maxWidth = Math.max(maxWidth, simulateFieldValue.width);
      }
      if (currentCursor.y + accumulatedHeight > availableHeight) {
        cursor.y = currentCursor.y;
        return {
          remainingFields: remainingFields.slice(index),
          width: maxWidth,
          height: accumulatedHeight,
        };
      }
      accumulatedHeight += margin / 6;

      const fieldTitle = await addText(doc, cursor, {
        content: getLocaleValue(field.label, lang),
        width,
        bold: true,
        lang,
        simulate,
      });

      cursor.y += fieldTitle.height;

      for (const fieldValueId of eventAdditionalField) {
        const option = field.options.find(opt => opt.id === fieldValueId);

        const fieldValue = await addText(doc, cursor, {
          content: getLocaleValue(option.label, lang),
          width,
          lang,
          simulate,
        });

        cursor.y += fieldValue.height;
      }
      cursor.y += margin / 6;
    }

    index += 1;
  }

  cursor.y = currentCursor.y;

  return {
    remainingFields: [],
    width: maxWidth,
    height: accumulatedHeight,
  };
}
