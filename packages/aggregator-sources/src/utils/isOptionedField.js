function isOptionedField(field) {
  return (
    ['radio', 'checkbox', 'select', 'multiselect'].includes(field.fieldType)
    && field.options?.length
  );
}

function isMultiOptionedField(field) {
  return (
    isOptionedField(field)
    && ['checkbox', 'multiselect'].includes(field.fieldType)
  );
}

isOptionedField.multi = isMultiOptionedField;

export default isOptionedField;
