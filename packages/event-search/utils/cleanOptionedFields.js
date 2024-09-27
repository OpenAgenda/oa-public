'use strict';

const includesAll = (arr, values) => values.every((v) => arr.includes(v));

module.exports = (event, formSchema) => {
  if (!formSchema) {
    return event;
  }
  return Object.keys(event).reduce((acc, curr) => {
    if (
      formSchema.fields.find((f) => f.field === curr)?.options
      && !includesAll(
        formSchema.fields
          .find((f) => f.field === curr)
          .options.map((o) => o.id),
        [].concat(event[curr]),
      )
    ) {
      const remaining = [].concat(event[curr]).filter((x) =>
        formSchema.fields
          .find((f) => f.field === curr)
          .options.map((o) => o.id)
          .includes(x));
      if (remaining.length) {
        return { ...acc, [curr]: remaining };
      }

      return { ...acc };
    }
    return { ...acc, [curr]: event[curr] };
  }, {});
};
