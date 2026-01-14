export default function getAdditionalFieldStats(agendaSchema) {
  return agendaSchema.fields
    .filter(
      (fieldSchema) => fieldSchema.options && fieldSchema.options.length > 0,
    )
    .map((fieldSchema) => {
      const isCheckbox = fieldSchema.fieldType === 'checkbox'
        && fieldSchema.options.length === 1;

      return {
        aggregation: {
          type: 'additionalFields',
          field: fieldSchema.field,
          missing: !isCheckbox ? 'null' : undefined,
        },
        chart: {
          type: isCheckbox ? 'pie' : 'vertical',
          dataKey: 'eventCount',
          labelKey: 'label',
          restItem: isCheckbox,
          dataColors: isCheckbox ? ['#1d77ce', '#c6c6c6'] : null,
          loadMore: !isCheckbox,
        },
      };
    });
}
