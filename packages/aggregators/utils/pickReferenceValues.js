const isAbstract = (f) => (f.fieldType ?? 'abstract') === 'abstract';

export default (schema, ...values) =>
  values.reduce(
    (picked, next) => ({
      ...picked,
      ...Object.keys(next)
        .filter((field) => {
          // `state` and `featured` are abstract agenda-event fields (not present
          // in the merged schema unless includeAgendaEvent is set) but they are
          // legitimate rule action targets, so let them through explicitly.
          if (field === 'state' || field === 'featured') {
            return true;
          }
          return schema.fields.find((f) => f.field === field && !isAbstract(f));
        })
        .reduce((accu, field) => ({ ...accu, [field]: next[field] }), {}),
    }),
    {},
  );
