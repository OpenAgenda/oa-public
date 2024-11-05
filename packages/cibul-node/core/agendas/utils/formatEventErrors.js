import eventFormLabels from '@openagenda/labels/event/form.js';
import eventErrorLabels from '@openagenda/labels/event/errors.js';
import makeLabelGetter from '@openagenda/labels';

const getFormLabel = makeLabelGetter(eventFormLabels);
const getErrorLabel = makeLabelGetter(eventErrorLabels);

export default function formatEventErrors(errors, lang) {
  return errors.map((error) => {
    const labelKeys = {};
    const fieldLabel = getFormLabel(error.field, lang);
    const label = getErrorLabel(error.code, lang);

    if (fieldLabel) {
      labelKeys.fieldLabel = fieldLabel;
    }
    if (label) {
      labelKeys.label = label;
    }

    return {
      ...error,
      ...labelKeys,
    };
  });
}
