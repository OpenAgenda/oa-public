const getFieldSlug = field => field.slug ?? field.field;
const getPath = (parentPath, slug) => ((parentPath ?? '').length ? `${parentPath}.${slug}` : slug);

const extractLanguages = label => (typeof label === 'string' || !label ? [] : Object.keys(label));
const uniq = items => items.reduce((deduped, item) => (deduped.includes(item) ? deduped : deduped.concat(item)), []);

const getLabel = (label, lang) => {
  if (!label) return label;
  if (typeof label === 'string') return label;
  if (label[lang]) return label[lang];
  return label[Object.keys(label).shift()];
};

const getMergedLabel = (field, parent) => {
  if (typeof field.label === 'string' && typeof parent.label === 'string') {
    return [parent.label, field.label].join(': ');
  }

  return uniq(
    extractLanguages(field.label).concat(extractLanguages(parent.label)),
  ).reduce((label, lang) => ({
    ...label,
    [lang]: [getLabel(parent.label, lang), getLabel(field.label, lang)].join(': '),
  }), {});
};

function getFlattenedSchemaFields(schema, options = {}) {
  const {
    path,
    prefixedLabels,
    parent,
  } = options;

  return schema.fields.reduce((fields, field) => {
    const fieldPath = getPath(path, getFieldSlug(field));

    if (field.schema) {
      return fields.concat(getFlattenedSchemaFields(field.schema, {
        ...options,
        parent: field,
        path: getPath(path, fieldPath),
      }));
    }
    fields.push({
      ...field,
      field: fieldPath,
      label: prefixedLabels && parent ? getMergedLabel(field, parent) : field.label,
    });
    return fields;
  }, []);
}

export default function getFlattenedSchema(schema, options = {}) {
  const params = {
    path: '',
    prefixedLabels: false,
    parent: null,
  };
  if (typeof options === 'string') {
    params.path = options;
  } else {
    Object.assign(params, options);
  }

  return {
    ...schema,
    fields: getFlattenedSchemaFields(schema, options),
  };
}
