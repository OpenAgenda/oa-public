import makeLabelGetter from '@openagenda/labels/makeLabelGetter.js';
import labels from './labels.js';
const getLabel = makeLabelGetter(labels);
export default (field, preferredLang) => {
  const {
    fieldType,
    languages
  } = field;
  let labelCode = [fieldType, languages ? 'Multilingual' : '', 'FieldType'].join('');
  if (!labels[labelCode]) labelCode = 'unknownFieldType';
  return getLabel(labelCode, preferredLang);
};
//# sourceMappingURL=getFieldTypeLabel.js.map