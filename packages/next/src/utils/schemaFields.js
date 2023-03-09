export function isChoiceField(field) {
  if (field.options) {
    return true;
  }
  return field.fieldType === 'boolean';
}

export function isAdditionalField(field) {
  return !!field.schemaId;
}
