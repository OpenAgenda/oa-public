import { getLocaleValue } from '@openagenda/intl';
import addText from './addText.js';

export default async function addStatus(doc, cursor, options = {}) {
  const { content, agenda, width, lang, simulate } = options;

  for (const field of agenda.schema.fields) {
    if (field.field === 'status') {
      const eventStatus = content;
      if (eventStatus) {
        const option = field.options.find(opt => [eventStatus].includes(opt.id));
        if (option) {
          const statusValue = await addText(doc, cursor, {
            content: getLocaleValue(option.label, lang),
            width,
            lang,
            simulate,
          });
          return {
            width: statusValue.width,
            height: statusValue.height,
          };
        }
      }
    }
  }
}
