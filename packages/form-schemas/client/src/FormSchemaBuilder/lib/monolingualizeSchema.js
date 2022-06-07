import extractSchemaLabelLanguages from './extractSchemaLabelLanguages';

const labelKeys = ['label', 'info', 'placeholder', 'sub'];

function flattenItem(item, languages) {
  const monolingualized = labelKeys.reduce((flat, key) => {
    if ((typeof flat[key] === 'string') || !flat[key]) {
      return flat;
    }
    for (const candidate of languages) {
      if (flat[key][candidate]) {
        return {
          ...flat,
          [key]: flat[key][candidate]
        };
      }
    }

    return flat;
  }, item);

  if (monolingualized.options) {
    monolingualized.options = monolingualized.options.map(o => flattenItem(o, languages));
  }

  return monolingualized;
}

export default function monolingualizeSchema(schema) {
  const languages = extractSchemaLabelLanguages(schema);

  return {
    ...schema,
    fields: schema.fields.map(field => flattenItem(field, languages))
  };
}
